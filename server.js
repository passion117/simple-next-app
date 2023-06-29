const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const PORT = 5000;

const {initializeApp} = require('firebase/app');
const admin = require('firebase-admin');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth, signInWithPhoneNumber, RecaptchaVerifier } = require("firebase/auth");

const {getFirestore, collection, addDoc, setDoc, where, query, doc, getDoc, getDocs} = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAh1RZYrG5TXhds5obiQi4oY8DTguP7fJg",
    authDomain: "next-83718-22eac.firebaseapp.com",
    projectId: "next-83718-22eac",
    storageBucket: "next-83718-22eac.appspot.com",
    messagingSenderId: "166726122426",
    appId: "1:166726122426:web:3977383913e60c48077b83",
    measurementId: "G-PDPYNVE5YE"
};
// Initialize Firebase
const serviceAccount = require("./fbServiceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let firebase_app = initializeApp(firebaseConfig);

const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app);

const getAuthToken = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      req.authToken = req.headers.authorization.split(' ')[1];
    } else {
      req.authToken = null;
    }
    next();
};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/register', async(req, res) => {
    try {
        const {email, password} = req.body;
        console.log(email, password);
        let result = await createUserWithEmailAndPassword(auth, email, password)
        return res.json({error:null, result});
    } catch(e) {
        return res.json({error:e, result:""});
    }
});

app.post('/login', async(req, res) => {
    try {
        const {email, password} = req.body;
        console.log(email, password);
        let result = await signInWithEmailAndPassword(auth, email, password)
        return res.json({error:null, result});
    } catch(e) {
        return res.json({error:e, result:""});
    }
});

app.post('/loginwithphone', async(req, res) => {
    try {
        const {phoneNumber} = req.body;
        console.log(phoneNumber);
        let result = await signInWithPhoneNumber(auth, phoneNumber, null);
        return res.json({error:null, result});
    } catch(e) {
        return res.json({error:e, result:""});
    }
});

app.get('/logout', async function(req , res){
    try {
        let result = await signOut();
        return res.json({error:null, result});
    } catch(e) {
        return res.json({error:e, result:""});
    }
});

app.post('/registration', getAuthToken, async (req,res) => {
    try {
        console.log(req.authToken);
        const {phonenumber, mailaddress, credit, year, month} = req.body;
        const userInfo = await admin.auth().verifyIdToken(req.authToken);
        console.log(userInfo);

        const q = query(collection(db, "payments"), where("email", "==", userInfo.email));
        const querySnapshot = await getDocs(q);
        if(querySnapshot.size) {
            querySnapshot.forEach(async sdoc => {
                await setDoc(doc(collection(db, "payments"),sdoc.id), {
                    email: userInfo.email,
                    phonenumber,
                    mailaddress,
                    credit,
                    year,
                    month
                });
            })
            console.log("Update");
        } else{
            const dbRef = collection(db, "payments");
            await addDoc(dbRef, {
                email: userInfo.email,
                phonenumber,
                mailaddress,
                credit,
                year,
                month
            });
            console.log("Create");
        }

        // Stripe
        const stripe = require('stripe')('sk_test_51N9ClAEdCSuRPLDGJ5DnMFt96B0qI1uM884M7nJyuAXRtIXLLh4vPZPH16AtRWSd2AiDsmVlrwckwXVjl7MUCo2t00j80ByyFM');
        let customer;

        const customers = await stripe.customers.list({
            email: mailaddress,
        });

        const {data} = customers;

        if(data.length > 0) {
            customer = data[0];
        } else {
            customer = await stripe.customers.create({
                description: '',
                email: mailaddress,
                phone: phonenumber,
            });
        }

        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
              number: credit,
              exp_month: month,
              exp_year: '20' + year,
              cvc: '314',
            },
        });

        // await stripe.paymentMethods.attach(paymentMethod.id, {customer:customer.id});
        // await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: paymentMethod.id, }, expand: ["invoice_settings.default_payment_method"], });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 500,
            currency: 'JPY',
            customer:customer.id,
            payment_method_types:['card'],
            payment_method:paymentMethod.id,
        });

        const confirmIntent = await stripe.paymentIntents.confirm(
            paymentIntent.id,
            {payment_method: paymentMethod.id}
        );

        return res.json({error:null, result:""});
    } catch(e) {
        console.log(e);
        return res.json({error:e, result:""});
    }
});

app.listen(PORT, () => {
   console.log(`backend server is running on ${PORT}`);
});