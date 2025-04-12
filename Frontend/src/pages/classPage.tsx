import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import ClassBody from '../components/class/classBody'
import '../styles/global.css';

const ClassPage: FunctionComponent = () => {
  return (
      <div className="pageWrapper">
          {/* Main content section */}
          <Header/>
          <div className="contentWrapper">
              <ClassBody/>
          </div>
          {/* Footer section */}
          <Footer/>
      </div>
  );
};

export default ClassPage;
