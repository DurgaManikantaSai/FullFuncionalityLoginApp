import toast from 'react-hot-toast'

export async function usernameValidate(values){
    const errors = usernameVerify({},values);
    return errors;
}

function usernameVerify( error ={}, values){
    if(!values.username){
        error.username = "Username Required...! "
    }else if(values.username.includes("")){
        error.username = toast.error('Invalid Username...!')
    }
}