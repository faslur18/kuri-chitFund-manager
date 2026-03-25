import { doc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

const initAdmin = async () => {
  const authRef = doc(db, 'admin_auth', 'credentials');
  await setDoc(authRef, {
    email: 'admin@kuri.app',
    password: 'admin123'
  });
  console.log('Admin credentials initialized!');
};

initAdmin();
