import { Navigate } from "react-router";
import { Wrapper } from "../../components/Wrapper";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../providers/useAuth";

export function JoinSession() {
  const { userToken, username } = useAuth();

  if (!userToken || !username) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <Wrapper>
      JOIN SESSION
      <p>Username: {username}</p>
    </Wrapper>
  );
}
