import UserModel from '../model/User.model.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ENV from '../config.js'
import otpGenerator from 'otp-generator'


/** middleware for verify user */

export async function verifyUser(req,res,next){
    try{
        const {username} = req.method == "GET" ? req.query : req.body;

        let exist = await UserModel.findOne({username});
        if(!exist) return res.status(404).send({error: "Can't find User!"});
        next();
    }
    catch(error){
        return res.status(404).send({error:"Authenticaion Error"});
    }
}


/**POST: https://localhost:8080/api/register
 * @param: {
 *  "username" : "example123",
 *  "password": "admin123", 
 *  "emial": "example@gmail.com",
 *  "firstName": "bill",
 *  "lastName": "willian",
 *  "mobile" : 9392699133,
 *  "address": "Apt . 556, Kulas light, Pedakalleaplli",
 *  "profile": "" 
 * }
 */
export async function register(req,res){
    try {
        const {username,password, profile, email} = req.body;

        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username }).then((err,user) => {
                if(err) reject(new Error(err))
                if(user) reject({ error: "Please use unique username"});
              
                resolve();
            }).catch(err => reject({error: "exist username findone error"}));
        });

        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email }).then((err,user) => {
                if(err) reject(new Error(err))
                if(user) reject({ error: "Please use unique email"});

                resolve();
            }).catch(err => reject({error: "exist email findone error"}));
        });
        Promise.all([existUsername,existEmail])
            .then(()=>{
                if(password){
                    bcrypt.hash(password,10)
                        .then( hashedPassword => {
                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                profile: profile || '',
                                email 
                            });

                            //return save result as a response
                            user.save()
                                .then(result => res.status(201).send({msg: "User registerd Successfully"}))
                                .catch(error => res.status(500).send({error})) 
                        })
                        .catch(error => {
                            return res.status(500).send({
                                error: "Unable to hash password"
                            })
                        })
                }
            })
            .catch(error => {
                return res.status(500).send({error})
            })
    }
    catch(error){
        return res.status(500).send(error);
    }
}


/**POST */
export async function login(req,res){
    const { username, password}  = req.body;
    try{
        UserModel.findOne({username})
            .then( user => {
                bcrypt.compare(password,user.password)
                    .then(passwordCheck => {
                        if(!passwordCheck) return res.status(400).send({error:"Don't have Password"})

                        //create jwt token
                       const token =  jwt.sign({
                             userId: user._id,
                             username: user.username
                            }, ENV.JWT_SECRET,{expiresIn: "24h"});

                        return res.status(200).send({
                            msg:"Login Successful..!",
                            username: user.username,
                            token
                        })
                        
                    })
                    .catch(error => {
                        return res.status(400).send({error: "Username not Found"})
                    })
            })
            .catch( error => {
                return res.status(404).send({error: "Username not Found"})
            })
            
    }
    catch(error){
        return res.status(500).send({error});
    }
}


/**GET: http://localhost:8080/api/user/example123 */
export async function getUser(req,res){
    const {username} = req.params;
    // console.log(username);

    try {
        if(!username) return res.staus(501).send({error:"Invalid Username"})
        UserModel.findOne({username})
            .then(user => {

                /**Removind password from the user 
                 * and mongoose return unnecessary data with object so convert it into json
                 */
                const {password, ...rest } = Object.assign({},user.toJSON());
                return res.status(201).send({userData:rest})})
            .catch(err => res.status(401).send({error: err}));
    }
    catch{
        return res.status(404).send({error: "Cannot Find User Data"})
    }
}


/**PUT : http://localhost:8080/api/updateuser
 * @param: {
 * "id": "<userid>"
 * }
 * body : {
 * firstName: '',
 * address: '',
 * profile: ''
 * }
 */
export async function updateUser(req,res){
    try {
        
        // const id = req.query.id;
        const { userId } = req.user;

        if(userId){
            const body = req.body;

            // update the data
            UserModel.updateOne({_id:userId},body)
                .then((result) => {
                    if(result){
                        return res.status(201).send({msg:"Record Updated...!"});
                    }
                    else{
                        return res.status(404).send({error:"Record Not Found"});
                    }
                })
                .catch((error) => {
                    return res.status(500).send({error:"Unable to update Record..."});
                })

        }else{
            return res.status(401).send({ error : "User Not Found...!"});
        }

    } catch (error) {
        return res.status(401).send({ error });
    }
}

export async function generateOTP(req,res){
    req.app.locals.OTP = await otpGenerator.generate(6,{lowerCaseAlphabets:false, upperCaseAlphabets:false, specialChars: false});
    res.status(201).send({code: req.app.locals.OTP})
}


export async function verifyOTP(req,res){
    const {code} = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        return res.status(201).send({msg:"Verify Successful"});
    }
    return res.status(400).send({error:"Invalid OTP"});
}

export async function createResetSession(req,res){
    if(req.app.locals.resetSession){
        req.app.locals.resetSession = false;
        return res.staus(201).send({msg: "access granted!"});
    }
    return res.status(440).send({error:"Session expired!"});
}

export async function resetPassword(req,res){
    try{
        if(!req.app.locals.resetSession) return res.status(440).send({error:"Session expired!"});
        const { username, password } = req.body;
        try{
            UserModel.findOne({username})
                .then(user => {
                    bcrypt.hash(password,10)
                        .then(hashedPassword => {
                            UserModel.updateOne({
                                username: user.usrname,
                                password: hashedPassword
                            })
                            .then(data => {
                                res.status(201).send({msg:"Record Updated!!"});
                            })
                            .catch(e => {
                                throw e;
                            })
                        })
                        .catch( e => {
                            return res.status(500).send({
                                error: "unable to hash password"
                            })
                        })
                })
                .catch(error => {
                    return res.status(404).send({error:"Username not Found"});
                })
        }
        catch(error){
            return res.staus(500).send({error})
        }
    }
    catch (err){
        return res.status(401).send({err});
    }
}

export async function getAllData(req,res){
    const allUserData = UserModel.find({}).
        then(result => res.status(201).send({msg:result}));
    // console.log(allUserData);
}