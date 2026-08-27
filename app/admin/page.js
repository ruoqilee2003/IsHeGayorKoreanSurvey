import { isAuthed } from "../../lib/adminAuth";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return isAuthed() ? <Dashboard /> : <LoginForm />;
}
