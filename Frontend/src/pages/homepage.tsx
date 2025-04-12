import { FunctionComponent } from 'react';

import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import HomepageBody from '../components/homepage/HomepageBody';
import '../styles/global.css';

const Homepage: FunctionComponent = () => {
    return (
        <div className="pageWrapper">
            <Header />
            <div className="contentWrapper">
                <HomepageBody />
            </div>
            <Footer />
        </div>
    );
};

export default Homepage;
