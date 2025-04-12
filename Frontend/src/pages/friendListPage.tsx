import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import FriendList from '../components/friendlist/listOfFriends'

import '../styles/global.css';

const FriendListPage: FunctionComponent = () => {
  return (
      <div className="pageWrapper">
          <Header/>
          <div className="contentWrapper">
              <FriendList/>
          </div>
          <Footer/>
      </div>
  );
};

export default FriendListPage;
