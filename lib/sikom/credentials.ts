const VALUE_CODE_LOGIN_PASSWORD = 'NotASecret';
const NON_VALUE_CODE_LOGIN_PASSWORD_SUFFIX = '!!!';

/**
 * Baseclass for credentials
 */
abstract class SikomCredentials {

    username: string;
    password: string;

    protected constructor(username: string, password: string) {
      this.username = username;
      this.password = password;
    }

    isEmpty(): boolean {
      return this.username.length == 0 && this.password.length == 0;
    }

    isNotEmpty(): boolean {
      return !this.isEmpty();
    }

    abstract toAuth() : any;

}

/**
 * Credentials with value code (registration_id) as username
 */
class SikomValueCodeCredentials extends SikomCredentials {

  constructor(username: string) {
    super(username, VALUE_CODE_LOGIN_PASSWORD);
  }

  toAuth() : any {
    return {
      username: this.username,
      password: this.password,
    };
  }

}

/**
 * Basic auth credentials (email and password)
 */
class SikomBasicAuthCredentials extends SikomCredentials {

  constructor(username: string, password: string) {
    super(username, password);
  }

  toAuth() : any {
    return {
      username: this.username,
      password: `${this.password}${NON_VALUE_CODE_LOGIN_PASSWORD_SUFFIX}`,
    };
  }

}

export { SikomCredentials, SikomValueCodeCredentials, SikomBasicAuthCredentials };
