import { FunctionComponent } from 'react';
import Content from '../components/verification/RegistrationConfirm';
import Footer from '../components/footer/footer';
import '../styles/global.css'; // Import the global styles

const RegisterConfirmation: FunctionComponent = () => {
  return (
    <div>
      {/* Main content section */}
      <Content />
      {/* Footer section */}
      <Footer />
    </div>
  );
};

export default RegisterConfirmation;
