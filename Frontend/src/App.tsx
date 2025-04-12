import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CalendarPage from './pages/calendarPage';
import ListOfTasksPage from './pages/listOfTasksPage';
import ProfilePage from './pages/profilePage';
import Login from './pages/login';
import RegisterPage from './pages/register';
import Register2fa from './pages/register2fa';
import RegisterConfirmation from './pages/registerConfirmation';
import BackToHome from './pages/backToHomePage';
import ProtectedRoute from './protectedRoute';
import { useAuthStore } from './context/AuthContext';
import RedirectAuthenticatedUser from './redirectAuthUser';
import CreateTaskPage from "./pages/createTaskPage";
import FriendListPage from './pages/friendListPage';
import AddFriendPage from './pages/addFriendPage';
import ClassPage from './pages/classPage';
import DesktopHomepage from './pages/homepage';
import TaskDescription from './pages/taskDescriptionPage';
import CodeEditor from './pages/codeEditorPage';
import { TaskProvider } from './context/TaskContext';
import Solutions from './pages/solutionsPage';
import Settings from './pages/settingsPage';
import Leaderboard from './pages/leaderboardPage';
import Forum from './pages/forumPage';
import DocsPage from './pages/DocsPage';
import { ClassProvider } from './context/ClassroomContext';

const App: React.FC = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {

    // keycloak.init({ onLoad: "login-required" }).then((authenticated: boolean | ((prevState: boolean) => boolean)) => {
    //   setAuthenticated(authenticated);
    //   if (authenticated) {
    //       console.log("Token:", keycloak.token);
    //   }
    // });

    checkAuth();
  }, [location.pathname, checkAuth]); // Runs every time the route changes

  if (isCheckingAuth) {
    return <div>Loading...</div>; // Replace with a spinner or splash screen
  }

  return (
    <Routes>
      <Route path="/" element={<DesktopHomepage />} />
      <Route path="/profilePage/:user_id" element={<ProtectedRoute> <ProfilePage /> </ProtectedRoute>} />
      <Route path="/login" element={<RedirectAuthenticatedUser> <Login /> </RedirectAuthenticatedUser>} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register2fa" element={<Register2fa />} />
      <Route path="/registerConfirmation" element={<RegisterConfirmation />} />
      <Route path="/backToHome" element={<BackToHome />} />
      <Route path="/calendarPage" element={<ProtectedRoute> <CalendarPage /> </ProtectedRoute>} /> 
      <Route path="/tasks/:task_id/createTaskPage" element={<ProtectedRoute> <TaskProvider> <CreateTaskPage /> </TaskProvider> </ProtectedRoute>} />

      <Route path="/lists/:list_id/listOfTasksPage/:classroom_id" element={<TaskProvider> <ListOfTasksPage /> </TaskProvider>} />
      <Route path="/tasks/:task_id/taskDescriptionPage/:classroom_id" element={<TaskProvider> <TaskDescription /> </TaskProvider>} />
      <Route path="/tasks/:task_id/codeEditorPage/:classroom_id" element={<TaskProvider> <CodeEditor /> </TaskProvider>} />
      <Route path="/tasks/:task_id/solutionsPage/:classroom_id" element={<Solutions />} />

      <Route path="/friendListPage" element={<FriendListPage />} />
      <Route path="/AddFriendPage" element={<AddFriendPage />} />
      <Route path="/classPage/:classroom_id/" element={<ProtectedRoute>
                                                       <ClassProvider>
                                                        <ClassPage /> 
                                                        </ClassProvider>
                                                      </ProtectedRoute>} />
      <Route path="/solutionsPage" element={<Solutions />} />
      <Route path="/forumPage" element={<Forum />} />
      <Route path="/leaderboardPage" element={<Leaderboard />} />
      <Route path="/settingsPage" element={<ProtectedRoute> <Settings /> </ProtectedRoute>} />
      <Route path="/docsPage" element={<DocsPage />} />
    </Routes>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
