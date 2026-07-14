import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchProfile(session.user);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  async function fetchProfile(user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser({ ...user, profile });
    } catch {
      setCurrentUser(user);
    }
    setLoading(false);
  }

  async function Login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
  }

  async function CreateUser(email, password, firstName, lastName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
      });
    }
    if (data?.user?.identities?.length === 0) {
      toast.error("An account with this email already exists.");
      return;
    }
    if (data?.user?.confirmed_at) {
      toast.success("Account created! You are now logged in.");
    } else {
      toast.success("Account created! Check your email for verification.");
    }
    return data.user;
  }

  async function Logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed: " + error.message);
      return;
    }
    setCurrentUser(null);
    toast.success("Logged out successfully!");
  }

  const value = {
    currentUser,
    loading,
    Login,
    Logout,
    CreateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
