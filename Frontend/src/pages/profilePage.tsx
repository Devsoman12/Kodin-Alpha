import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import ProfileBody from '../components/profile/profileBody'
import ProfileCard from '../components/profile/projectCardProfile'

import '../styles/global.css'; // Import the global styles

const profilePage: FunctionComponent = () => {
  return (
      <div className="pageWrapper">
          {/* Main content section */}
          <Header/>
          <div className="contentWrapper">
              <ProfileBody/>
              <ProfileCard/>
          </div>
          {/* Footer section */}
          <Footer/>
      </div>
  );
};

export default profilePage;
