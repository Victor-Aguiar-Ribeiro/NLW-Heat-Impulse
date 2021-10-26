import { createContext , ReactNode, useEffect, useState } from 'react';
import { api } from '../services/api';

type AuthProvider = {
  children: ReactNode;
}

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type AuthContextData = {
  user: User | null;
  signInUrl: string;
  signOut: () => void;
}

// Tipagem para retorno da API 
type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

export const AuthContext = createContext( {} as AuthContextData );

export function AuthProvider ( props: AuthProvider ) {

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=8fe821d1eb3de22c60ec`;
  const [ user, setUser ] = useState<User | null>( null );

  async function signIn( githubCode: string ) {
    const response = await api.post<AuthResponse>( '/authenticate', {
      code: githubCode,
    });

    // Separando os dados recebidos entre token, e user data
    const { token , user } = response.data;
    
    // Guardando o token no localStorage para manter o usuário autenticado por mais tempo
    localStorage.setItem ( '@dowhile: token', token );

    // Prevenção de erros -> para quando o usuário faz login mesmo sem dar reload na página
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  }

  // Implementando função de logoout
  function signOut() {
    setUser(null);
    localStorage.removeItem( '@dowhile: token' );
  }

  // Mantendo usuário conectado após recarregar a página.
  useEffect(() => {
    const token = localStorage.getItem('@dowhile: token');

    if ( token ) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<User>( 'profile' ).then( response => {
        setUser( response.data );
      })
    }

  },[]);

  useEffect(() => {
    // Passando url do browser para uma variável. Logo depois, conferindo se a url possui o código
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    if(hasGithubCode) {
      // Separando a url em: url_sem_código, e código;
      const [urlWithoutCode , githubCode] = url.split('?code=');

      signIn(githubCode);
      
      // Limpando url para que o código não seja exibido em tela em nenhum momento
      window.history.pushState( {} ,'', urlWithoutCode);
    }
  },[]);

  return (
    <AuthContext.Provider  value = {{ signInUrl, user, signOut }} >
      { props.children }
    </AuthContext.Provider>
    );
}