import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';
import ProfilePage from './pages/ProfilePage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import TaskDetailsPage from './pages/TaskDetailsPage';

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={token ? <Navigate to="/student" /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/student" /> : <RegisterPage />} />
      <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path="/teacher" element={token ? <TeacherPage /> : <Navigate to="/login" />} />
      <Route path="/student" element={token ? <StudentPage /> : <Navigate to="/login" />} />
      <Route path="/group/:groupId" element={token ? <GroupDetailsPage /> : <Navigate to="/login" />} />
      <Route path="/task/:taskId" element={token ? <TaskDetailsPage /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;