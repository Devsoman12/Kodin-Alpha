import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import Content from '../components/taskDescription/TaskDescription'

import '../styles/global.css';
import ClassBody from "../components/class/classBody"; // Import the global styles

const taskDescriptionPage: FunctionComponent = () => {
  return (
      <div className="pageWrapper">
          {/* Main content section */}
          <Header/>
          <div className="contentWrapper">
              <Content/>
          </div>
          {/* Footer section */}
          <Footer/>
      </div>
  );
};

export default taskDescriptionPage;
