import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import AddFriendBody from '../components/friendlist/AddFriendBody';

import '../styles/global.css'; // Import the global styles

const FriendListPage: FunctionComponent = () => {
    return (
        <div className="pageWrapper">
            <Header />
            <div className="contentWrapper">
                <AddFriendBody />
            </div>
            <Footer />
        </div>
    );
};

export default FriendListPage;
