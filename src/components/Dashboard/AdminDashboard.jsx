import Workspace from './Workspace';
import PropTypes from 'prop-types';

export default function AdminDashboard({ user, onLogout }) {
  return <Workspace user={user} isAdmin onLogout={onLogout} />;
}

AdminDashboard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
};
