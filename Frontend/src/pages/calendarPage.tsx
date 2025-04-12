import { FunctionComponent } from 'react';
import Header from '../components/header/FullHeader';
import Footer from '../components/footer/footer';
import CalendarBody from '../components/calendar/calendarBody';
import '../styles/global.css';

const CalendarPage: FunctionComponent = () => {
    return (
        <div className="pageWrapper">
            <Header />
            <div className="contentWrapper">
                <CalendarBody />
            </div>
            <Footer />
        </div>
    );
};

export default CalendarPage;