import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-south-1_DvWek4Epl',
      userPoolClientId: '6kh37oia147685ksn4q2m3711s',
      loginWith: {
        email: true
      }
    }
  }
});
