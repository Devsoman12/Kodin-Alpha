import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import Content from '../components/forum/Forum';

import '../styles/global.css'; // Import the global styles

const ForumPage: FunctionComponent = () => {
    return (
        <div className="pageWrapper">
            <Header />
            <div className="contentWrapper">
                <Content />
            </div>
            <Footer />
        </div>
    );
};

export default ForumPage;
