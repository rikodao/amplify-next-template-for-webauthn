"use client";

import { useState } from "react";
import { Amplify } from "aws-amplify";
import { signIn, confirmSignIn } from "aws-amplify/auth";
import outputs from "@/amplify_outputs.json";
import { useAuthenticator } from "@aws-amplify/ui-react";

  
const { signOut } = useAuthenticator();
Amplify.configure(outputs);

export default function App() {
  
  const [email, setEmail] = useState(""); // メールアドレスの状態
  const [otpCode, setOtpCode] = useState(""); // OTPコードの状態
  const [isCodeSent, setIsCodeSent] = useState(false); // コード送信済みかどうか
  const [isSignedIn, setIsSignedIn] = useState(false); // サインイン済みかどうか
  const [error, setError] = useState(""); // エラーメッセージ

  // メールアドレスでサインイン開始（OTP送信）
  const handleSendCode = async () => {
    try {
      const { nextStep: signInNextStep } = await signIn({
        username: email,
        options: {
          authFlowType: "USER_AUTH",
          preferredChallenge: "WEB_AUTHN",
        },
      });

      if (signInNextStep.signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
        setIsCodeSent(true); // コード送信済み状態に
        setError(""); // エラーをリセット
      }
    } catch (err) {
      setError("コード送信中にエラーが発生しました");
    }
  };

  // 確認コードでサインイン完了
  const handleConfirmSignIn = async () => {
    try {
      const { nextStep: confirmSignInNextStep } = await confirmSignIn({
        challengeResponse: otpCode,
      });

      if (confirmSignInNextStep.signInStep === "DONE") {
        setIsSignedIn(true); // サインイン済み状態に
        setError("");
      }
    } catch (err) {
      setError("サインイン中にエラーが発生しました");
    }
  };

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      textAlign: "center",
      backgroundColor: "#f3f4f6",
      padding: "50px",
      borderRadius: "10px",
      width: "350px",
      margin: "100px auto",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    heading: {
      marginBottom: "20px",
      fontSize: "24px",
      color: "#333",
    },
    inputGroup: {
      display: "flex",
      alignItems: "center",
      marginBottom: "20px",
      gap: "10px",
    },
    input: {
      flex: 1,
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    successMessage: {
      color: "green",
      fontSize: "18px",
      fontWeight: "bold",
    },
    error: {
      color: "red",
      marginTop: "10px",
    },
  };

  return (
    <div>
      <h1 style={styles.heading}>Passwordless Sign In</h1>
      {!isSignedIn ? (
        !isCodeSent ? (
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
            />
            <button
              style={styles.button}
              onClick={handleSendCode}
              disabled={!email}
            >
              コードを送信
            </button>
          </div>
        ) : (
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="確認コードを入力"
            />
            <button
              style={styles.button}
              onClick={handleConfirmSignIn}
              disabled={!otpCode}
            >
              サインイン
            </button>
          </div>
        )
      ) : (
        <p style={styles.successMessage}>サインインに成功しました！</p>
      )}
      {error && <p style={styles.error}>{error}</p>}
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}