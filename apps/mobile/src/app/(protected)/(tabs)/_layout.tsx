import { Tabs } from 'expo-router'

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: '#f97316',
				tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
				tabBarStyle: {
					borderTopColor: '#e5e7eb',
					height: 72,
					paddingBottom: 10,
					paddingTop: 10,
				},
			}}
		>
			<Tabs.Screen name="index" options={{ tabBarLabel: 'Annonces', title: 'Annonces' }} />
			<Tabs.Screen name="account" options={{ tabBarLabel: 'Compte', title: 'Compte' }} />
		</Tabs>
	)
}
