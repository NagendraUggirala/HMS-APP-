import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorLayout, { useSidebar } from "./DoctorLayout";

const MessageItem = ({ sender, message, time, unread, avatarColor }) => (
  <TouchableOpacity style={styles.messageRow}>
    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
      <Text style={styles.avatarText}>{sender.split(' ').map(n=>n[0]).join('')}</Text>
    </View>
    <View style={styles.messageContent}>
      <View style={styles.messageHeader}>
        <Text style={[styles.senderName, unread && styles.unreadText]}>{sender}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
      <Text style={[styles.messageSnippet, unread && styles.unreadMessage]} numberOfLines={1}>
        {message}
      </Text>
    </View>
    {unread && <View style={styles.unreadDot} />}
  </TouchableOpacity>
);

const MessagingContent = () => {
  const { toggleSidebar } = useSidebar();

  const chats = [
    { id: 1, sender: "Dr. Sarah Miller", message: "Patient Smith's labs are lookining better today.", time: "10:24 AM", unread: true, avatarColor: "#dbeafe" },
    { id: 2, sender: "Nursed John Doe", message: "Regarding the discharge papers for Room 302...", time: "09:45 AM", unread: true, avatarColor: "#fef9c3" },
    { id: 3, sender: "Receptionist Mary", message: "A new appointment has been scheduled.", time: "Yesterday", unread: false, avatarColor: "#dcfce7" },
    { id: 4, sender: "Lab Tech Kevin", message: "The results for Emily Davis are uploaded.", time: "Yesterday", unread: false, avatarColor: "#f3e8ff" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Ionicons name="create-outline" size={22} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput placeholder="Search messages..." style={styles.searchInput} placeholderTextColor="#94a3b8" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Chats</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>2 New</Text>
          </View>
        </View>

        {chats.map(chat => (
          <MessageItem key={chat.id} {...chat} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function Messaging() {
  return (
    <DoctorLayout>
      <MessagingContent />
    </DoctorLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  newChatButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1e293b",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginRight: 10,
  },
  countBadge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1e293b",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  senderName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  unreadText: {
    fontWeight: "800",
  },
  timeText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  messageSnippet: {
    fontSize: 13,
    color: "#64748b",
  },
  unreadMessage: {
    color: "#334155",
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginLeft: 10,
  },
});
