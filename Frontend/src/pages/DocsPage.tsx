import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import Content from '../components/docs/DocsPage';
import '../styles/global.css';
const profilePage: FunctionComponent = () => {
    return (
        <div className="pageWrapper">
            {/*<Header/>*/}
            <div className="contentWrapper">
                <Content/>
            </div>
            {/*<Footer/>*/}
        </div>
    );
};

export default profilePage;
