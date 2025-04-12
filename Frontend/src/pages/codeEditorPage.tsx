import { FunctionComponent } from 'react';

import '../styles/global.css'; // Import the global styles
import TaskWriter from '../components/taskWriter/TaskWriter';

const profilePage: FunctionComponent = () => {
  return (
    <div>
      <TaskWriter />
    </div>
  );
};

export default profilePage;
