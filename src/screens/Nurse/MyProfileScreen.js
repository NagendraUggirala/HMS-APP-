import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

const MyProfileContent = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", date_of_birth: "", address: "", city: "", state: "", country: "", postal_code: "", emergency_contact: "", emergency_contact_phone: "", avatar_url: "",
    department_id: "", designation: "", nursing_license_number: "", specialization: "", experience_years: "", shift_type: "DAY", employment_type: "FULL_TIME", bio: "", is_active: true, qualifications: "", certifications: "", clinical_skills: "", languages_spoken: "", department_name: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const normalizeProfile = (data, user) => {
    const profileData = data || {};
    return {
      ...profile,
      ...profileData,
      name: profileData.name || user?.full_name || user?.name || profile.name,
      email: profileData.email || user?.email || profile.email,
      phone: profileData.phone || user?.phone_number || user?.phone || profile.phone,
      avatar_url: profileData.avatar_url || profile.avatar_url || '',
      is_active: profileData.is_active !== undefined ? profileData.is_active : profile.is_active,
      experience_years: profileData.experience_years !== undefined ? String(profileData.experience_years) : profile.experience_years,
      department_name: profileData.department_name || profile.department_name || '',
      qualifications: Array.isArray(profileData.qualifications) ? profileData.qualifications.join(", ") : (profileData.qualifications || profile.qualifications),
      certifications: Array.isArray(profileData.certifications) ? profileData.certifications.join(", ") : (profileData.certifications || profile.certifications),
      clinical_skills: Array.isArray(profileData.clinical_skills) ? profileData.clinical_skills.join(", ") : (profileData.clinical_skills || profile.clinical_skills),
      languages_spoken: Array.isArray(profileData.languages_spoken) ? profileData.languages_spoken.join(", ") : (profileData.languages_spoken || profile.languages_spoken),
    };
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let currentUser = {};
      try {
        const stored = await AsyncStorage.getItem("currentUser");
        if (stored) currentUser = JSON.parse(stored);
      } catch (e) {
        console.warn("Could not load currentUser", e);
      }

      const data = await api.getNurseProfile();
      setProfile(normalizeProfile(data, currentUser));
    } catch (err) {
      console.error('Fetch profile error:', err.message);
      setError(`Could not load profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      
      const payload = {
        department_id: profile.department_id || "DEPT-001",
        nurse_id: profile.nurse_id || "NURSE-001",
        nursing_license_number: profile.nursing_license_number || "PENDING",
        designation: profile.designation || "Staff Nurse",
        specialization: profile.specialization,
        experience_years: parseInt(profile.experience_years) || 0,
        shift_type: profile.shift_type || "DAY",
        employment_type: profile.employment_type || "FULL_TIME",
        bio: profile.bio,
        is_active: profile.is_active,
        qualifications: profile.qualifications ? profile.qualifications.split(",").map(s => s.trim()).filter(Boolean) : [],
        certifications: profile.certifications ? profile.certifications.split(",").map(s => s.trim()).filter(Boolean) : [],
        clinical_skills: profile.clinical_skills ? profile.clinical_skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        languages_spoken: profile.languages_spoken ? profile.languages_spoken.split(",").map(s => s.trim()).filter(Boolean) : [],
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        postal_code: profile.postal_code,
        emergency_contact: profile.emergency_contact,
        emergency_contact_phone: profile.emergency_contact_phone
      };

      const data = await api.updateNurseProfile(payload);
      
      let currentUser = {};
      try {
        const stored = await AsyncStorage.getItem("currentUser");
        if (stored) {
          currentUser = JSON.parse(stored);
          currentUser.phone_number = profile.phone;
          currentUser.phone = profile.phone;
          currentUser.email = profile.email;
          currentUser.full_name = profile.name;
          currentUser.name = profile.name;
          await AsyncStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
      } catch (e) {
        console.warn("Could not update currentUser in storage", e);
      }

      setProfile(normalizeProfile(data, currentUser));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', `Error updating profile: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setProfile({ ...profile, avatar_url: `data:image/jpeg;base64,${result.assets[0].base64}` });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-2xl font-semibold text-gray-700 mb-6">My Profile</Text>
      
      {loading && (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-500 mt-2">Loading profile...</Text>
        </View>
      )}
      
      {!loading && error && (
        <View className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
          <Text className="text-yellow-700">{error}</Text>
        </View>
      )}
      
      {!loading && !error && (
        <View className="flex-col gap-6 lg:flex-row">
          {/* Left Column */}
          <View className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm lg:w-1/3">
            <View className="flex-col items-center mb-4">
              <TouchableOpacity onPress={isEditing ? pickImage : undefined} className="relative">
                <Image 
                  source={{ uri: profile.avatar_url || "https://i.pravatar.cc/100?img=5" }} 
                  className="w-24 h-24 rounded-full mb-3" 
                />
                {isEditing && (
                  <View className="absolute bottom-3 right-0 bg-blue-600 rounded-full p-1.5 border-2 border-white">
                    <Ionicons name="camera" size={14} color="white" />
                  </View>
                )}
              </TouchableOpacity>
              <Text className="text-xl font-semibold">{profile.name}</Text>
              <Text className="text-gray-600">{profile.designation} - {profile.department_name || profile.department_id}</Text>
              <View className="mt-1">
                <View className={`px-2 py-1 rounded-full ${profile.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text className={`text-xs ${profile.is_active ? 'text-green-800' : 'text-red-800'}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="space-y-3 mt-4">
              <View className="flex-row items-center">
                <Ionicons name="mail" size={20} color="#6b7280" className="mr-3 w-5 text-center" />
                <Text className="text-sm text-gray-800 ml-2">{profile.email}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="call" size={20} color="#6b7280" className="mr-3 w-5 text-center" />
                <Text className="text-sm text-gray-800 ml-2">{profile.phone}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#6b7280" className="mr-3 w-5 text-center" />
                <Text className="text-sm text-gray-800 ml-2">Shift: {profile.shift_type}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="briefcase" size={20} color="#6b7280" className="mr-3 w-5 text-center" />
                <Text className="text-sm text-gray-800 ml-2">Experience: {profile.experience_years} years</Text>
              </View>
              {!!profile.nursing_license_number && (
                <View className="flex-row items-center">
                  <Ionicons name="medal" size={20} color="#6b7280" className="mr-3 w-5 text-center" />
                  <Text className="text-sm text-gray-800 ml-2">License: {profile.nursing_license_number}</Text>
                </View>
              )}
              {!!profile.emergency_contact && (
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={20} color="#ef4444" className="mr-3 w-5 text-center" />
                  <Text className="text-sm text-gray-800 ml-2">{profile.emergency_contact}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)}
              disabled={saveLoading}
              className="w-full mt-6 bg-blue-600 py-2 rounded flex-row justify-center items-center"
            >
              <Ionicons name="create" size={16} color="white" className="mr-1" />
              <Text className="text-white font-medium ml-1">
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Right Column */}
          <View className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm lg:w-2/3">
            <Text className="text-lg font-semibold mb-4">Professional Information</Text>
            
            {isEditing ? (
              <View className="space-y-4">
                {/* Basic Info */}
                <View>
                  <Text className="font-medium text-gray-700 mb-3 text-sm">Basic Information</Text>
                  <View className="flex-row flex-wrap -mx-2">
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Name</Text>
                      <TextInput value={profile.name} onChangeText={t => setProfile({...profile, name: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Email</Text>
                      <TextInput value={profile.email} onChangeText={t => setProfile({...profile, email: t})} className="w-full border border-gray-300 rounded p-2 text-sm" keyboardType="email-address" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Phone</Text>
                      <TextInput value={profile.phone} onChangeText={t => setProfile({...profile, phone: t})} className="w-full border border-gray-300 rounded p-2 text-sm" keyboardType="phone-pad" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Date of Birth</Text>
                      <TextInput value={profile.date_of_birth} onChangeText={t => setProfile({...profile, date_of_birth: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                  </View>
                </View>
                
                {/* Professional Details */}
                <View className="border-t border-gray-200 pt-3 mt-3">
                  <Text className="font-medium text-gray-700 mb-3 text-sm">Professional Details</Text>
                  <View className="flex-row flex-wrap -mx-2">
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Department</Text>
                      <TextInput value={profile.department_id} onChangeText={t => setProfile({...profile, department_id: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Designation</Text>
                      <TextInput value={profile.designation} onChangeText={t => setProfile({...profile, designation: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Shift Type</Text>
                      <TextInput value={profile.shift_type} onChangeText={t => setProfile({...profile, shift_type: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Employment Type</Text>
                      <TextInput value={profile.employment_type} onChangeText={t => setProfile({...profile, employment_type: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Experience (Years)</Text>
                      <TextInput value={String(profile.experience_years)} onChangeText={t => setProfile({...profile, experience_years: t})} className="w-full border border-gray-300 rounded p-2 text-sm" keyboardType="numeric" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Specialization</Text>
                      <TextInput value={profile.specialization} onChangeText={t => setProfile({...profile, specialization: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">License Number</Text>
                      <TextInput value={profile.nursing_license_number} onChangeText={t => setProfile({...profile, nursing_license_number: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Status (true/false)</Text>
                      <TextInput value={String(profile.is_active)} onChangeText={t => setProfile({...profile, is_active: t === 'true'})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-full px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Qualifications (comma separated)</Text>
                      <TextInput value={profile.qualifications} onChangeText={t => setProfile({...profile, qualifications: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-full px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Certifications (comma separated)</Text>
                      <TextInput value={profile.certifications} onChangeText={t => setProfile({...profile, certifications: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-full px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Clinical Skills (comma separated)</Text>
                      <TextInput value={profile.clinical_skills} onChangeText={t => setProfile({...profile, clinical_skills: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-full px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Languages Spoken (comma separated)</Text>
                      <TextInput value={profile.languages_spoken} onChangeText={t => setProfile({...profile, languages_spoken: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                  </View>
                </View>
                
                {/* Address */}
                <View className="border-t border-gray-200 pt-3 mt-3">
                  <Text className="font-medium text-gray-700 mb-3 text-sm">Address</Text>
                  <View className="mb-3">
                    <Text className="text-xs font-medium text-gray-600 mb-1">Address</Text>
                    <TextInput value={profile.address} onChangeText={t => setProfile({...profile, address: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                  </View>
                  <View className="flex-row flex-wrap -mx-2">
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">City</Text>
                      <TextInput value={profile.city} onChangeText={t => setProfile({...profile, city: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">State</Text>
                      <TextInput value={profile.state} onChangeText={t => setProfile({...profile, state: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Country</Text>
                      <TextInput value={profile.country} onChangeText={t => setProfile({...profile, country: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Postal Code</Text>
                      <TextInput value={profile.postal_code} onChangeText={t => setProfile({...profile, postal_code: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                  </View>
                </View>
                
                {/* Emergency Contact */}
                <View className="border-t border-gray-200 pt-3 mt-3">
                  <Text className="font-medium text-gray-700 mb-3 text-sm">Emergency Contact</Text>
                  <View className="flex-row flex-wrap -mx-2">
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Contact Name</Text>
                      <TextInput value={profile.emergency_contact} onChangeText={t => setProfile({...profile, emergency_contact: t})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                    </View>
                    <View className="w-1/2 px-2 mb-3">
                      <Text className="text-xs font-medium text-gray-600 mb-1">Contact Phone</Text>
                      <TextInput value={profile.emergency_contact_phone} onChangeText={t => setProfile({...profile, emergency_contact_phone: t})} className="w-full border border-gray-300 rounded p-2 text-sm" keyboardType="phone-pad" />
                    </View>
                  </View>
                </View>
                
                {/* Bio */}
                <View className="border-t border-gray-200 pt-3 mt-3 mb-4">
                  <Text className="font-medium text-gray-700 mb-3 text-sm">Bio</Text>
                  <TextInput value={profile.bio} onChangeText={t => setProfile({...profile, bio: t})} className="w-full border border-gray-300 rounded p-2 text-sm min-h-[80px]" multiline textAlignVertical="top" placeholder="Enter your professional bio" />
                </View>
                
                <View className="flex-row gap-2 border-t border-gray-200 pt-3">
                  <TouchableOpacity 
                    onPress={handleSave}
                    disabled={saveLoading}
                    className="flex-1 bg-green-600 py-2 rounded flex-row justify-center items-center"
                  >
                    {saveLoading ? <ActivityIndicator color="white" /> : <Text className="text-white text-sm font-medium">Save Changes</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View className="flex-row flex-wrap -mx-2 mb-6">
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Name</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.name || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Email</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.email || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Phone</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.phone || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Date of Birth</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.date_of_birth || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Experience</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.experience_years} years</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Qualifications</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.qualifications || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">License Number</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.nursing_license_number || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Certifications</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.certifications || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Specialization</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.specialization || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Department</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.department_name || profile.department_id || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Clinical Skills</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.clinical_skills || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 px-2 mb-4">
                    <Text className="text-xs text-gray-500">Languages Spoken</Text>
                    <Text className="font-medium text-sm text-gray-800 mt-1">{profile.languages_spoken || 'N/A'}</Text>
                  </View>
                </View>
                
                <Text className="font-medium mb-2 text-sm text-gray-800">Location</Text>
                <View className="mb-6">
                  {!!profile.address && <Text className="text-sm text-gray-600">{profile.address}</Text>}
                  <Text className="text-sm text-gray-600">
                    {profile.city ? profile.city + ', ' : ''}
                    {profile.state ? profile.state + ' ' : ''}
                    {profile.postal_code ? profile.postal_code + ' ' : ''}
                    {profile.country || ''}
                  </Text>
                </View>
                
                {!!profile.emergency_contact && (
                  <View className="mb-6">
                    <Text className="font-medium mb-2 text-sm text-gray-800">Emergency Contact</Text>
                    <Text className="text-sm text-gray-600">{profile.emergency_contact}</Text>
                    <Text className="text-sm text-gray-600">{profile.emergency_contact_phone}</Text>
                  </View>
                )}
                
                {!!profile.bio && (
                  <View className="mb-6">
                    <Text className="font-medium mb-2 text-sm text-gray-800">Bio</Text>
                    <Text className="text-sm text-gray-600">{profile.bio}</Text>
                  </View>
                )}
                
                <Text className="font-medium mb-2 text-sm text-gray-800">Current Responsibilities</Text>
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark" size={16} color="#22c55e" className="mr-2" />
                    <Text className="text-sm text-gray-600 ml-1">Patient vital signs monitoring</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark" size={16} color="#22c55e" className="mr-2" />
                    <Text className="text-sm text-gray-600 ml-1">Medication administration</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark" size={16} color="#22c55e" className="mr-2" />
                    <Text className="text-sm text-gray-600 ml-1">Emergency response team</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark" size={16} color="#22c55e" className="mr-2" />
                    <Text className="text-sm text-gray-600 ml-1">Patient education and counseling</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
      <View className="h-10" />
    </ScrollView>
  );
};

export default function MyProfileScreen() {
  return (
    <NurseLayout>
      <MyProfileContent />
    </NurseLayout>
  );
}
