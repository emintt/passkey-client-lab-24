import fetchData from '@/lib/fetchData';
import { UserWithNoPassword } from '@sharedTypes/DBTypes';
import { UserResponse } from '@sharedTypes/MessageTypes';
import { startRegistration } from '@simplewebauthn/browser';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
// TODO: add imports for WebAuthn functions

const useUser = () => {
  // implement network functions for auth server user endpoints
  const getUserByToken = async (token: string) => {
    const options = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    return await fetchData<UserResponse>(
      import.meta.env.VITE_AUTH_API + '/users/token/',
      options,
    );
  };

  const getUsernameAvailable = async (username: string) => {
    return await fetchData<{ available: boolean }>(
      import.meta.env.VITE_AUTH_API + '/users/username/' + username,
    );
  };

  const getEmailAvailable = async (email: string) => {
    return await fetchData<{ available: boolean }>(
      import.meta.env.VITE_AUTH_API + '/users/email/' + email,
    );
  };

  return { getUserByToken, getUsernameAvailable, getEmailAvailable };
};

// Define usePasskey hook
const usePasskey = () => {
  // Define postUser function
  const postUser = async (user: UserWithNoPassword) => {
    // Set up request options
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    };

    // Fetch setup response
    const registrationResponse = await fetchData<{ 
      email: string;
      options: PublicKeyCredentialCreationOptionsJSON
      }>(
      import.meta.env.VITE_PASSKEY_API + '/auth/setup',
      options,
    );
    console.log(registrationResponse);
    
    // vastaus mikä tulee verifikaatiolta, challenge tallennetaan passey serverille
    // Start registration process
    const attResp = await startRegistration(registrationResponse.options);
  
    // Prepare data for verification
    const data = {
      email: registrationResponse.email,
      registrationOptions: attResp,
    };
    // Fetch and return verification response
    return await fetchData<UserResponse>(
      import.meta.env.VITE_PASSKEY_API + '/auth/verify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
  };

  // TODO: Define postLogin function
  const postLogin = async (email: string) => {
    // TODO: Fetch login setup options

    // TODO: Start authentication process
    // TODO: Fetch and return login verification response
  };

  // TODO: Return postUser and postLogin functions
  return { postUser, postLogin };
};

export { useUser, usePasskey };
