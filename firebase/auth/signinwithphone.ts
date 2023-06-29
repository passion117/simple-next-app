import firebase_app from "../config";
import { signInWithPhoneNumber, getAuth , RecaptchaVerifier} from "firebase/auth";

const auth = getAuth(firebase_app);

export default async function signInwithphone(phoneNumber: any) {
    let result = null,
        error = null;
    try {
        let recaptchaVerifier = RecaptchaVerifier('recaptcha-container');
        result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        console.log(result);
    } catch (e) {
        error = e;
    }

    return { result, error };
}