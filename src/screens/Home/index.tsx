import React from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";

import { Header } from "../../components/Header/indes";
import { MessagesList } from "../../components/MessagesList";
import { SendMessageForm } from "../../components/SendMessageForm";
import { SignInBox } from "../../components/SignInBox";

import { useAuth } from "../../hooks/auth";

import { styles } from './styles';

export function Home() {
  const { user } = useAuth();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header />
        
        {user ? <SendMessageForm /> : <MessagesList />}
      </View> 
    </KeyboardAvoidingView>
  )
}