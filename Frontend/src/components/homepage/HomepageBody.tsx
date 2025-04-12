import { FunctionComponent } from 'react';
import MainButton from './homePageButtons/MainButton';
import HeadLine from './desktopHeadline';

import CImage from '../../assets/c.svg';
import CodeImage from '../../assets/code.svg';
import PlusImage from '../../assets/plus.svg';

const HomepageBody: FunctionComponent = () => {
    return (
        <div className="content-wrapper">
            <HeadLine />

            <div className="stacked-buttons-container">
                <MainButton
                    icon={CImage}
                    link="/CalendarPage"
                    hoverText="Join or manage classrooms, collaborate with peers, and track your learning progress."
                    direction="left"
                />

                <MainButton
                    icon={CodeImage}
                    link={`/lists/${0}/listOfTasksPage/${0}`}
                    hoverText="Explore coding resources and tools."
                    direction="right"
                />

                <MainButton
                    icon={PlusImage}
                    link={`/tasks/${0}/createTaskPage/`}
                    hoverText="Add new items and manage content."
                    direction="left"
                />
            </div>
        </div>
    );
};

export default HomepageBody;
