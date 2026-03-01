import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { chatWithClaude } from '../services/claude';
import { FONT_HEADING_SEMIBOLD, FONT_BODY, FONT_BODY_SEMIBOLD } from '../constants/fonts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const systemContext = user
    ? `User: ${user.form.name}. Zip: ${user.form.zipCode}. Profile: ${JSON.stringify(user.profile)}. Welcome summary: ${user.welcomeSummary}.`
    : 'No user profile.';

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const reply = await chatWithClaude(text, systemContext, history);
      setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, something went wrong. Check your API key.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, systemContext]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Compass support</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={styles.bubbleText}>{item.content}</Text>
              </View>
            )}
          />
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#0ea5e9" />
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything..."
              placeholderTextColor="#64748b"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
              returnKeyType="send"
              editable={!loading}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontFamily: FONT_HEADING_SEMIBOLD, fontSize: 18, color: '#0f172a' },
  close: { fontFamily: FONT_BODY, fontSize: 16, color: '#0ea5e9' },
  listContent: { padding: 16, paddingBottom: 8 },
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0ea5e9' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9' },
  bubbleText: { fontFamily: FONT_BODY, fontSize: 15, color: '#0f172a' },
  loadingRow: { paddingHorizontal: 16, paddingVertical: 8 },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    fontFamily: FONT_BODY,
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  sendBtn: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
  },
  sendText: { fontFamily: FONT_BODY_SEMIBOLD, fontSize: 16, color: '#fff' },
});
