import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import Content from '../components/settings/settingsBody';

import '../styles/global.css'; // Import the global styles

const SettingsPage: FunctionComponent = () => {
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

export default SettingsPage;
