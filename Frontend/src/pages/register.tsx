import { FunctionComponent } from 'react';
import Content from '../components/verification/registrationForm';
import Footer from '../components/footer/footer';
import '../styles/global.css'; // Import the global styles

const Register: FunctionComponent = () => {
  return (
      <div className="pageWrapper">
          <div className="contentWrapper">
              <Content/>
          </div>
          <Footer/>
      </div>
  );
};

export default Register;
