import { Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import SectionCard from "../components/SectionCard";
import StaffCard from "../components/StaffCard";
import StatsCard from "../components/StatsCard";
import { useAppContext } from "../context/AppContext";

export default function HospitalDashboardScreen({ navigation, route }) {
  const { hospitalId } = route.params;
  const {
    currentRole,
    getAdminsByHospital,
    getHospitalById,
    getDoctorsByHospital,
    getEmployeeCountByHospital,
    getNursesByHospital,
    getPatientsByHospital,
    toggleHospitalStatus,
  } = useAppContext();

  const hospital = getHospitalById(hospitalId);
  const admins = getAdminsByHospital(hospitalId);
  const doctors = getDoctorsByHospital(hospitalId);
  const nurses = getNursesByHospital(hospitalId);
  const patients = getPatientsByHospital(hospitalId);
  const employeeCount = getEmployeeCountByHospital(hospitalId);

  if (!hospital) {
    return (
      <ScreenContainer>
        <View className="rounded-[28px] border border-surface-300 bg-surface-50 p-5">
          <Text className="text-2xl font-bold text-ink-900">Hospital not found</Text>
          <Text className="mt-2 text-sm text-ink-500">
            The selected hospital record is not available anymore.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="rounded-[28px] border border-surface-300 bg-surface-50 p-5">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-brand-700">
          Hospital Dashboard
        </Text>
        <Text className="mt-3 text-3xl font-bold text-ink-900">{hospital.name}</Text>
        <Text className="mt-2 text-sm text-ink-700">{hospital.location}</Text>
        <Text className="mt-1 text-sm text-ink-500">{hospital.email}</Text>
        <Text className="mt-1 text-sm text-ink-500">{hospital.phone}</Text>
        <Text className="mt-4 text-sm font-semibold uppercase text-ink-500">
          Status: {hospital.status}
        </Text>
      </View>

      <View className="mt-6 flex-row">
        <StatsCard label="Admins" value={admins.length} accent="bg-violet-500" />
        <StatsCard label="Doctors" value={doctors.length} accent="bg-emerald-500" />
      </View>
      <View className="mt-3 flex-row">
        <StatsCard label="Nurses" value={nurses.length} accent="bg-amber-500" />
        <StatsCard
          label="Employees"
          value={employeeCount}
          accent="bg-brand-500"
          helperText={`${patients.length} patients`}
        />
      </View>

      <SectionCard
        title="Management Actions"
        subtitle="Use role-based actions to manage staff and hospital setup."
        rightLabel={currentRole || "view"}
      >
        {currentRole === "superadmin" ? (
          <>
            <PrimaryButton
              title="Create Admin"
              onPress={() =>
                navigation.navigate("CreateAdmin", {
                  hospitalId,
                  returnTo: "HospitalDashboard",
                })
              }
            />
            <View className="mt-3">
              <PrimaryButton
                title={
                  hospital.status === "active"
                    ? "Mark As Inactive"
                    : "Mark As Active"
                }
                variant="secondary"
                onPress={() => toggleHospitalStatus(hospitalId)}
              />
            </View>
          </>
        ) : null}

        {currentRole === "admin" ? (
          <>
            <PrimaryButton
              title="Create Doctor"
              onPress={() =>
                navigation.navigate("CreateDoctor", {
                  hospitalId,
                  returnTo: "AdminDashboard",
                })
              }
            />
            <View className="mt-3">
              <PrimaryButton
                title="Create Nurse"
                variant="secondary"
                onPress={() =>
                  navigation.navigate("CreateNurse", {
                    hospitalId,
                    returnTo: "AdminDashboard",
                  })
                }
              />
            </View>
            <View className="mt-3">
              <PrimaryButton
                title="Create Patient"
                variant="ghost"
                onPress={() =>
                  navigation.navigate("CreatePatient", {
                    hospitalId,
                    returnTo: "AdminDashboard",
                  })
                }
              />
            </View>
          </>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Admins"
        subtitle="Hospital administrators assigned to this hospital."
        rightLabel={`${admins.length}`}
      >
        {admins.length ? (
          admins.map((admin) => (
            <StaffCard
              key={admin.id}
              name={admin.name}
              roleLabel="Admin"
              specialtyOrDepartment="Operations and configuration"
              email={admin.email}
              phone={admin.phone}
            />
          ))
        ) : (
          <View className="rounded-3xl border border-surface-300 bg-white p-4">
            <Text className="text-sm text-ink-500">
              No admins have been assigned yet.
            </Text>
          </View>
        )}
      </SectionCard>

      <SectionCard
        title="Doctors"
        subtitle="Doctors assigned to this hospital."
        rightLabel={`${doctors.length}`}
      >
        {doctors.length ? (
          doctors.map((doctor) => (
            <StaffCard
              key={doctor.id}
              name={doctor.name}
              roleLabel="Doctor"
              specialtyOrDepartment={doctor.specialty}
              email={doctor.email}
              phone={doctor.phone}
            />
          ))
        ) : (
          <View className="rounded-3xl border border-surface-300 bg-white p-4">
            <Text className="text-sm text-ink-500">
              No doctors have been added yet.
            </Text>
          </View>
        )}
      </SectionCard>

      <SectionCard
        title="Nurses"
        subtitle="Nurses assigned to this hospital."
        rightLabel={`${nurses.length}`}
      >
        {nurses.length ? (
          nurses.map((nurse) => (
            <StaffCard
              key={nurse.id}
              name={nurse.name}
              roleLabel="Nurse"
              specialtyOrDepartment={nurse.department}
              email={nurse.email}
              phone={nurse.phone}
            />
          ))
        ) : (
          <View className="rounded-3xl border border-surface-300 bg-white p-4">
            <Text className="text-sm text-ink-500">
              No nurses have been added yet.
            </Text>
          </View>
        )}
      </SectionCard>

      <SectionCard
        title="Patients"
        subtitle="Patients linked to this hospital."
        rightLabel={`${patients.length}`}
      >
        {patients.length ? (
          patients.map((patient) => (
            <StaffCard
              key={patient.id}
              name={patient.name}
              roleLabel="Patient"
              specialtyOrDepartment={patient.condition}
              email={patient.email}
              phone={patient.phone}
            />
          ))
        ) : (
          <View className="rounded-3xl border border-surface-300 bg-white p-4">
            <Text className="text-sm text-ink-500">
              No patients have been added yet.
            </Text>
          </View>
        )}
      </SectionCard>
    </ScreenContainer>
  );
}
