import toast from 'react-hot-toast'
import {authenticate} from './helper'

export async function usernameValidate(values){
    const errors = usernameVerify({},values);

    if(values.username) {
        // check user exist or not
        const {status} = await authenticate(values.username);

        if(status !== 200){
            errors.exist = toast.error('User does not exist');
        }
    }
    return errors;
}

function usernameVerify( error ={}, values){
    if(!values.username){
        error.username = "Username Required...! "
    }else if(values.username.includes("")){
        error.username = toast.error('Invalid Username...!')
    }
}