import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ReceptionistLayout from "./ReceptionistLayout";


export const RaiseTicketScreen = () => {
    return (
            <ReceptionistLayout>
        <View style={styles.container}>
            <Text style={styles.title}>Raise a Ticket</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your issue here..."
                multiline
                numberOfLines={4}
            />
        </View>
        </ReceptionistLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        height: 120,
        textAlignVertical: "top",
    },
});