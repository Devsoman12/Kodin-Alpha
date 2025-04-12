import { FunctionComponent, useEffect } from 'react';
import Content from '../components/verification/loginForm';
import Footer from '../components/footer/footer';
import '../styles/global.css';
import Header from "../components/header/FullHeader";
import ProfileBody from "../components/profile/profileBody";
import ProfileCard from "../components/profile/projectCardProfile"; // Import the global styles

const Login: FunctionComponent = () => {


  return (
      <div className="pageWrapper">
          <div className="contentWrapper">
            <Content/>
          </div>
          <Footer/>
      </div>)
};

export default Login;
