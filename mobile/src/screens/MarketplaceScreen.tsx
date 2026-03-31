import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    FlatList, TextInput, ActivityIndicator, RefreshControl, Alert, Modal,
} from 'react-native';
import { colors, typography } from '../theme';
import { Card } from '../components';
import {
    Equipment, LaborProvider, Booking,
    EquipmentListResponse, LaborProviderListResponse,
    MarketplaceStats,
} from '../types';
import {
    getEquipmentList, getLaborList, getMarketplaceStats,
    seedMarketplace, createBooking, getMyBookings,
} from '../services/marketplaceService';

// ─── Category Config ────────────────────────────────────────────────────────

const EQUIPMENT_CATEGORIES = [
    { key: '', label: 'All', icon: '📦' },
    { key: 'tractor', label: 'Tractors', icon: '🚜' },
    { key: 'harvester', label: 'Harvesters', icon: '🌾' },
    { key: 'tiller', label: 'Tillers', icon: '⚙️' },
    { key: 'seeder', label: 'Seeders', icon: '🌱' },
    { key: 'sprayer', label: 'Sprayers', icon: '💧' },
    { key: 'drone', label: 'Drones', icon: '🛸' },
    { key: 'other', label: 'Other', icon: '🔧' },
];

const LABOR_SKILLS = [
    { key: '', label: 'All', icon: '👥' },
    { key: 'planting', label: 'Planting', icon: '🌱' },
    { key: 'harvesting', label: 'Harvesting', icon: '🌾' },
    { key: 'spraying', label: 'Spraying', icon: '💧' },
    { key: 'irrigation', label: 'Irrigation', icon: '🚿' },
    { key: 'weeding', label: 'Weeding', icon: '🪴' },
    { key: 'soil_preparation', label: 'Soil Prep', icon: '🏗️' },
    { key: 'transport', label: 'Transport', icon: '🚛' },
];

const STATUS_COLORS: Record<string, string> = {
    pending: '#FF9800',
    confirmed: '#2196F3',
    in_progress: '#9C27B0',
    completed: '#4CAF50',
    cancelled: '#D32F2F',
};

// ─── Rating Stars Component ────────────────────────────────────────────────

const RatingStars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    if (half) stars += '★';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) stars += '☆';
    return <Text style={{ fontSize: size, color: '#F59E0B' }}>{stars}</Text>;
};

// ─── Equipment Card ─────────────────────────────────────────────────────────

const EquipmentCard: React.FC<{
    item: Equipment;
    onBook: (item: Equipment) => void;
}> = ({ item, onBook }) => {
    const categoryIcon =
        EQUIPMENT_CATEGORIES.find(c => c.key === item.category)?.icon || '📦';

    return (
        <Card style={styles.listCard}>
            <View style={styles.listCardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={styles.categoryIcon}>{categoryIcon}</Text>
                </View>
                <View style={styles.listCardInfo}>
                    <Text style={styles.listCardTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.listCardLocation}>📍 {item.location}</Text>
                </View>
                <View style={styles.rateContainer}>
                    <Text style={styles.rateAmount}>₹{item.daily_rate.toLocaleString()}</Text>
                    <Text style={styles.rateLabel}>/day</Text>
                </View>
            </View>

            {item.description ? (
                <Text style={styles.listCardDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}

            <View style={styles.listCardMeta}>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Condition</Text>
                    <Text style={[
                        styles.conditionBadge,
                        { backgroundColor: item.condition === 'excellent' ? '#4CAF5020' : '#FF980020' },
                        { color: item.condition === 'excellent' ? '#4CAF50' : '#FF9800' },
                    ]}>
                        {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                    </Text>
                </View>
                {item.avg_rating ? (
                    <View style={styles.metaItem}>
                        <RatingStars rating={item.avg_rating} />
                        <Text style={styles.reviewCount}>({item.review_count})</Text>
                    </View>
                ) : null}
                {item.hourly_rate ? (
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>₹{item.hourly_rate}/hr</Text>
                    </View>
                ) : null}
            </View>

            <TouchableOpacity
                style={[styles.bookButton, { backgroundColor: colors.primary }]}
                onPress={() => onBook(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.bookButtonText}>📋 Book Now</Text>
            </TouchableOpacity>
        </Card>
    );
};

// ─── Labor Card ─────────────────────────────────────────────────────────────

const LaborCard: React.FC<{
    item: LaborProvider;
    onHire: (item: LaborProvider) => void;
}> = ({ item, onHire }) => {
    const skillTags = item.skills.split(',').map(s => s.trim());

    return (
        <Card style={styles.listCard}>
            <View style={styles.listCardHeader}>
                <View style={[styles.avatarCircle, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={styles.avatarText}>
                        {item.name.split(' ').map(w => w[0]).join('').toUpperCase()}
                    </Text>
                </View>
                <View style={styles.listCardInfo}>
                    <Text style={styles.listCardTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.listCardLocation}>📍 {item.location}</Text>
                </View>
                <View style={styles.rateContainer}>
                    <Text style={styles.rateAmount}>₹{item.daily_rate.toLocaleString()}</Text>
                    <Text style={styles.rateLabel}>/day</Text>
                </View>
            </View>

            {item.bio ? (
                <Text style={styles.listCardDesc} numberOfLines={2}>{item.bio}</Text>
            ) : null}

            <View style={styles.skillTagsRow}>
                {skillTags.slice(0, 4).map((skill, idx) => (
                    <View key={idx} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>{skill}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.listCardMeta}>
                <View style={styles.metaItem}>
                    <RatingStars rating={item.rating} />
                    <Text style={styles.reviewCount}>{item.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>🛠 {item.total_jobs} jobs</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>📅 {item.experience_years} yrs</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.bookButton, { backgroundColor: '#1565C0' }]}
                onPress={() => onHire(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.bookButtonText}>🤝 Hire Now</Text>
            </TouchableOpacity>
        </Card>
    );
};

// ─── Booking Card ───────────────────────────────────────────────────────────

const BookingCard: React.FC<{ item: Booking }> = ({ item }) => {
    const statusColor = STATUS_COLORS[item.status] || '#999';
    return (
        <Card style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <Text style={styles.bookingType}>
                    {item.booking_type === 'equipment' ? '🚜' : '👷'}{' '}
                    {item.equipment_name || item.labor_provider_name || 'Booking'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {item.status.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.bookingDetails}>
                <Text style={styles.bookingDate}>
                    📅 {item.start_date} → {item.end_date}
                </Text>
                <Text style={styles.bookingCost}>₹{item.total_cost.toLocaleString()}</Text>
            </View>
        </Card>
    );
};

// ─── Stats Banner ───────────────────────────────────────────────────────────

const StatsBanner: React.FC<{ stats: MarketplaceStats }> = ({ stats }) => (
    <View style={styles.statsBanner}>
        <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.available_equipment}</Text>
            <Text style={styles.statLabel}>Equipment Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.available_labor}</Text>
            <Text style={styles.statLabel}>Workers Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total_bookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
    </View>
);

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════

type TabKey = 'equipment' | 'labor' | 'bookings';

const MarketplaceScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState<TabKey>('equipment');
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [labor, setLabor] = useState<LaborProvider[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<MarketplaceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');

    // Booking modal state
    const [bookingModal, setBookingModal] = useState(false);
    const [bookingTarget, setBookingTarget] = useState<{
        type: 'equipment' | 'labor';
        id: number;
        name: string;
        rate: number;
    } | null>(null);
    const [bookingStartDate, setBookingStartDate] = useState('');
    const [bookingEndDate, setBookingEndDate] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ── Data Loading ────────────────────────────────────────────────────────

    const loadStats = async () => {
        try {
            const data = await getMarketplaceStats();
            setStats(data);
        } catch (err) {
            console.log('Stats load error:', err);
        }
    };

    const loadEquipment = async () => {
        try {
            const params: any = { available_only: true };
            if (selectedCategory) params.category = selectedCategory;
            if (searchQuery) params.q = searchQuery;
            const data = await getEquipmentList(params);
            setEquipment(data.items);
        } catch (err: any) {
            console.log('Equipment load error:', err.message);
            // If API fails, load demo data
            setEquipment(DEMO_EQUIPMENT);
        }
    };

    const loadLabor = async () => {
        try {
            const params: any = { available_only: true };
            if (selectedSkill) params.skills = selectedSkill;
            if (searchQuery) params.q = searchQuery;
            const data = await getLaborList(params);
            setLabor(data.items);
        } catch (err: any) {
            console.log('Labor load error:', err.message);
            setLabor(DEMO_LABOR);
        }
    };

    const loadBookings = async () => {
        try {
            const data = await getMyBookings();
            setBookings(data.items);
        } catch (err: any) {
            console.log('Bookings load error:', err.message);
            setBookings([]);
        }
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        await loadStats();
        if (activeTab === 'equipment') await loadEquipment();
        else if (activeTab === 'labor') await loadLabor();
        else await loadBookings();
        setLoading(false);
    }, [activeTab, selectedCategory, selectedSkill, searchQuery]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // ── Booking Flow ────────────────────────────────────────────────────────

    const openBookingModal = (type: 'equipment' | 'labor', id: number, name: string, rate: number) => {
        setBookingTarget({ type, id, name, rate });
        // Set default dates (today and tomorrow)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setBookingStartDate(today.toISOString().split('T')[0]);
        setBookingEndDate(tomorrow.toISOString().split('T')[0]);
        setBookingNotes('');
        setBookingModal(true);
    };

    const handleBookEquipment = (item: Equipment) => {
        openBookingModal('equipment', item.id, item.name, item.daily_rate);
    };

    const handleHireLabor = (item: LaborProvider) => {
        openBookingModal('labor', item.id, item.name, item.daily_rate);
    };

    const submitBooking = async () => {
        if (!bookingTarget) return;
        if (!bookingStartDate || !bookingEndDate) {
            Alert.alert('Missing Dates', 'Please fill in both start and end dates (YYYY-MM-DD).');
            return;
        }

        setSubmitting(true);
        try {
            const bookingData: any = {
                booking_type: bookingTarget.type,
                start_date: bookingStartDate,
                end_date: bookingEndDate,
                notes: bookingNotes || undefined,
            };
            if (bookingTarget.type === 'equipment') {
                bookingData.equipment_id = bookingTarget.id;
            } else {
                bookingData.labor_provider_id = bookingTarget.id;
            }

            await createBooking(bookingData);
            Alert.alert(
                '✅ Booking Confirmed!',
                `Your ${bookingTarget.type} booking for "${bookingTarget.name}" has been placed successfully.`,
            );
            setBookingModal(false);
            // Refresh bookings
            if (activeTab === 'bookings') await loadBookings();
        } catch (err: any) {
            Alert.alert('Booking Failed', err?.response?.data?.detail || err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const calculateEstimate = (): number => {
        if (!bookingTarget || !bookingStartDate || !bookingEndDate) return 0;
        try {
            const start = new Date(bookingStartDate);
            const end = new Date(bookingEndDate);
            const days = Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
            return bookingTarget.rate * days;
        } catch {
            return bookingTarget.rate;
        }
    };

    // ── Seed Trigger ────────────────────────────────────────────────────────

    const handleSeed = async () => {
        try {
            await seedMarketplace();
            Alert.alert('Success', 'Marketplace seeded with sample data!');
            await loadData();
        } catch (err: any) {
            Alert.alert('Info', err?.response?.data?.message || 'Marketplace already seeded');
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerSubtitle}>Equipment & Labor</Text>
                    <Text style={styles.headerTitle}>Marketplace</Text>
                </View>
                <TouchableOpacity onPress={handleSeed} style={styles.seedButton}>
                    <Text style={styles.seedButtonText}>🌱</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Banner */}
            {stats && <StatsBanner stats={stats} />}

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {([
                    { key: 'equipment' as TabKey, label: '🚜 Equipment', color: colors.primary },
                    { key: 'labor' as TabKey, label: '👷 Labor', color: '#1565C0' },
                    { key: 'bookings' as TabKey, label: '📋 My Bookings', color: '#7B1FA2' },
                ]).map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            activeTab === tab.key && { backgroundColor: tab.color, borderColor: tab.color },
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === tab.key && styles.tabTextActive,
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Search Bar (for equipment and labor tabs) */}
            {activeTab !== 'bookings' && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={activeTab === 'equipment' ? '🔍 Search equipment...' : '🔍 Search workers...'}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => loadData()}
                        returnKeyType="search"
                    />
                </View>
            )}

            {/* Category Filter Chips */}
            {activeTab === 'equipment' && (
                <ScrollView
                    horizontal showsHorizontalScrollIndicator={false}
                    style={styles.chipScroll}
                    contentContainerStyle={styles.chipContainer}
                >
                    {EQUIPMENT_CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[
                                styles.chip,
                                selectedCategory === cat.key && styles.chipActive,
                            ]}
                            onPress={() => setSelectedCategory(cat.key)}
                        >
                            <Text style={styles.chipIcon}>{cat.icon}</Text>
                            <Text style={[
                                styles.chipText,
                                selectedCategory === cat.key && styles.chipTextActive,
                            ]}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {activeTab === 'labor' && (
                <ScrollView
                    horizontal showsHorizontalScrollIndicator={false}
                    style={styles.chipScroll}
                    contentContainerStyle={styles.chipContainer}
                >
                    {LABOR_SKILLS.map(skill => (
                        <TouchableOpacity
                            key={skill.key}
                            style={[
                                styles.chip,
                                selectedSkill === skill.key && styles.chipActive,
                            ]}
                            onPress={() => setSelectedSkill(skill.key)}
                        >
                            <Text style={styles.chipIcon}>{skill.icon}</Text>
                            <Text style={[
                                styles.chipText,
                                selectedSkill === skill.key && styles.chipTextActive,
                            ]}>{skill.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading marketplace...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[colors.primary]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'equipment' && (
                        equipment.length > 0 ? (
                            equipment.map(item => (
                                <EquipmentCard
                                    key={item.id}
                                    item={item}
                                    onBook={handleBookEquipment}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>🚜</Text>
                                <Text style={styles.emptyTitle}>No Equipment Found</Text>
                                <Text style={styles.emptyText}>
                                    No equipment available for the selected filters. Try changing your search or tap 🌱 to seed sample data.
                                </Text>
                            </View>
                        )
                    )}

                    {activeTab === 'labor' && (
                        labor.length > 0 ? (
                            labor.map(item => (
                                <LaborCard
                                    key={item.id}
                                    item={item}
                                    onHire={handleHireLabor}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>👷</Text>
                                <Text style={styles.emptyTitle}>No Workers Found</Text>
                                <Text style={styles.emptyText}>
                                    No labor providers available for the selected filters. Try broadening your search.
                                </Text>
                            </View>
                        )
                    )}

                    {activeTab === 'bookings' && (
                        bookings.length > 0 ? (
                            bookings.map(item => (
                                <BookingCard key={item.id} item={item} />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>📋</Text>
                                <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                                <Text style={styles.emptyText}>
                                    You haven't made any bookings. Browse equipment or hire labor to get started!
                                </Text>
                            </View>
                        )
                    )}
                </ScrollView>
            )}

            {/* ── Booking Modal ── */}
            <Modal
                visible={bookingModal}
                animationType="slide"
                transparent
                onRequestClose={() => setBookingModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {bookingTarget?.type === 'equipment' ? '🚜 Book Equipment' : '🤝 Hire Worker'}
                            </Text>
                            <TouchableOpacity onPress={() => setBookingModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalItemName}>{bookingTarget?.name}</Text>
                        <Text style={styles.modalRate}>₹{bookingTarget?.rate.toLocaleString()}/day</Text>

                        <View style={styles.modalDivider} />

                        <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={bookingStartDate}
                            onChangeText={setBookingStartDate}
                            placeholder="2026-04-01"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={bookingEndDate}
                            onChangeText={setBookingEndDate}
                            placeholder="2026-04-03"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={styles.inputLabel}>Notes (optional)</Text>
                        <TextInput
                            style={[styles.modalInput, styles.notesInput]}
                            value={bookingNotes}
                            onChangeText={setBookingNotes}
                            placeholder="Any special requirements..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                        />

                        <View style={styles.estimateRow}>
                            <Text style={styles.estimateLabel}>Estimated Total</Text>
                            <Text style={styles.estimateValue}>₹{calculateEstimate().toLocaleString()}</Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: bookingTarget?.type === 'equipment' ? colors.primary : '#1565C0' },
                            ]}
                            onPress={submitBooking}
                            disabled={submitting}
                            activeOpacity={0.7}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    ✓ Confirm {bookingTarget?.type === 'equipment' ? 'Rental' : 'Hiring'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ─── Demo Data (used when API is unavailable) ───────────────────────────────

const DEMO_EQUIPMENT: Equipment[] = [
    {
        id: 1, owner_id: 1, name: 'Mahindra 575 DI Tractor', category: 'tractor',
        description: '45 HP tractor with power steering, ideal for medium-sized farms.',
        daily_rate: 2500, hourly_rate: 400, location: 'Pune, Maharashtra',
        is_available: true, condition: 'excellent', review_count: 12, avg_rating: 4.5,
    },
    {
        id: 2, owner_id: 1, name: 'Claas Crop Tiger 30 Harvester', category: 'harvester',
        description: 'Self-propelled combine harvester for wheat and rice.',
        daily_rate: 8500, hourly_rate: 1200, location: 'Indore, MP',
        is_available: true, condition: 'good', review_count: 8, avg_rating: 4.2,
    },
    {
        id: 3, owner_id: 1, name: 'DJI AGRAS T30 Spray Drone', category: 'drone',
        description: 'Agricultural spraying drone. 30L tank, 40 acres/hour.',
        daily_rate: 5000, hourly_rate: 800, location: 'Hyderabad, TG',
        is_available: true, condition: 'excellent', review_count: 15, avg_rating: 4.8,
    },
    {
        id: 4, owner_id: 1, name: 'KMW Rotavator 6ft', category: 'tiller',
        description: 'Heavy-duty rotavator for field preparation.',
        daily_rate: 1500, hourly_rate: 250, location: 'Aurangabad, MH',
        is_available: true, condition: 'good', review_count: 5, avg_rating: 4.0,
    },
    {
        id: 5, owner_id: 1, name: 'Honda Portable Sprayer', category: 'sprayer',
        description: '25L capacity knapsack power sprayer for pesticide spraying.',
        daily_rate: 400, hourly_rate: 80, location: 'Kolhapur, MH',
        is_available: true, condition: 'excellent', review_count: 20, avg_rating: 4.6,
    },
];

const DEMO_LABOR: LaborProvider[] = [
    {
        id: 1, user_id: 1, name: 'Rajesh Kumar', skills: 'planting,harvesting,general',
        experience_years: 12, daily_rate: 600, hourly_rate: 80, location: 'Pune, Maharashtra',
        is_available: true, bio: 'Experienced farm worker — paddy & sugarcane specialist.',
        rating: 4.7, total_jobs: 85, review_count: 30,
    },
    {
        id: 2, user_id: 1, name: 'Meena Devi', skills: 'planting,weeding,harvesting',
        experience_years: 15, daily_rate: 500, hourly_rate: 70, location: 'Indore, MP',
        is_available: true, bio: 'Expert in transplanting rice and vegetable saplings.',
        rating: 4.8, total_jobs: 120, review_count: 45,
    },
    {
        id: 3, user_id: 1, name: 'Arun Yadav', skills: 'irrigation,spraying,soil_preparation',
        experience_years: 10, daily_rate: 650, hourly_rate: 90, location: 'Hyderabad, TG',
        is_available: true, bio: 'Tech-savvy farm laborer — modern irrigation & drone spraying.',
        rating: 4.6, total_jobs: 70, review_count: 25,
    },
    {
        id: 4, user_id: 1, name: 'Lakshmi Bai', skills: 'harvesting,planting,weeding',
        experience_years: 20, daily_rate: 500, hourly_rate: 65, location: 'Nagpur, MH',
        is_available: true, bio: '20 years cotton & soybean farming. Highly reliable.',
        rating: 4.9, total_jobs: 200, review_count: 60,
    },
];

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F3',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    backArrow: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    seedButton: {
        marginLeft: 'auto',
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
    },
    seedButtonText: {
        fontSize: 20,
    },

    // Stats Banner
    statsBanner: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: -8,
        borderRadius: 14,
        padding: 14,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
    },
    statLabel: {
        fontSize: 10,
        color: colors.textLight,
        marginTop: 2,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginVertical: 4,
    },

    // Tab Bar
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 14,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textLight,
    },
    tabTextActive: {
        color: '#fff',
    },

    // Search
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },

    // Filter Chips
    chipScroll: {
        maxHeight: 44,
        marginTop: 10,
    },
    chipContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipActive: {
        backgroundColor: colors.primary + '18',
        borderColor: colors.primary,
    },
    chipIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    chipText: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: '500',
    },
    chipTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },

    // Content
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },

    // List Cards
    listCard: {
        padding: 16,
        marginBottom: 14,
        borderRadius: 14,
    },
    listCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryIcon: {
        fontSize: 22,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    listCardInfo: {
        flex: 1,
    },
    listCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
    },
    listCardLocation: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },
    rateContainer: {
        alignItems: 'flex-end',
    },
    rateAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
    rateLabel: {
        fontSize: 10,
        color: colors.textLight,
    },
    listCardDesc: {
        fontSize: 13,
        color: colors.textLight,
        lineHeight: 18,
        marginBottom: 10,
    },
    listCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaLabel: {
        fontSize: 12,
        color: colors.textLight,
    },
    conditionBadge: {
        fontSize: 11,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        overflow: 'hidden',
    },
    reviewCount: {
        fontSize: 12,
        color: colors.textLight,
        marginLeft: 2,
    },

    // Skill Tags
    skillTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
    skillTag: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    skillTagText: {
        fontSize: 11,
        color: '#1565C0',
        fontWeight: '500',
    },

    // Book Button
    bookButton: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    // Booking Cards
    bookingCard: {
        padding: 14,
        marginBottom: 10,
        borderRadius: 12,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bookingType: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    bookingDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookingDate: {
        fontSize: 12,
        color: colors.textLight,
    },
    bookingCost: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },

    // Loading & Empty
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: colors.textLight,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 13,
        color: colors.textLight,
        textAlign: 'center',
        paddingHorizontal: 32,
        lineHeight: 20,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    modalClose: {
        fontSize: 22,
        color: colors.textLight,
        padding: 4,
    },
    modalItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    modalRate: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 8,
    },
    modalDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
        marginTop: 8,
    },
    modalInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    notesInput: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    estimateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    estimateLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    estimateValue: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.primary,
    },
    submitButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default MarketplaceScreen;
