import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/readings_provider.dart';
import '../../models/daily_reading.dart';
import '../../router/app_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';

class ReadingsScreen extends StatelessWidget {
  const ReadingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ReadingsProvider>();
    final list     = provider.filtered;

    return Column(
      children: [
        PageHeader(
          title: 'Daily Readings',
          subtitle: '${provider.readings.length} total · ${provider.publishedCount} published · ${provider.draftCount} draft',
          actions: [
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white, foregroundColor: AppColors.primary),
              onPressed: () => context.go(AppRoutes.addReading),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Add Reading'),
            ),
          ],
        ),

        // ── Filter bar ────────────────────────────────────────────────────────
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            children: [
              SizedBox(
                width: 240,
                child: TextField(
                  onChanged: provider.setSearch,
                  decoration: InputDecoration(
                    hintText: 'Search readings…',
                    prefixIcon: const Icon(Icons.search, size: 18),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    suffixIcon: provider.searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 16),
                            onPressed: () => provider.setSearch(''))
                        : null,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              _StatusChip(label: 'All',       value: '',          current: provider.statusFilter, onTap: provider.setStatusFilter),
              const SizedBox(width: 6),
              _StatusChip(label: 'Published', value: 'published', current: provider.statusFilter, onTap: provider.setStatusFilter),
              const SizedBox(width: 6),
              _StatusChip(label: 'Draft',     value: 'draft',     current: provider.statusFilter, onTap: provider.setStatusFilter),
            ],
          ),
        ),

        // ── List ──────────────────────────────────────────────────────────────
        Expanded(
          child: list.isEmpty
              ? EmptyState(
                  icon: Icons.menu_book_outlined,
                  message: 'No readings found.',
                  actionLabel: 'Add Reading',
                  onAction: () => context.go(AppRoutes.addReading),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) => _ReadingCard(reading: list[i]),
                ),
        ),
      ],
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final String value;
  final String current;
  final ValueChanged<String> onTap;
  const _StatusChip({required this.label, required this.value,
      required this.current, required this.onTap});

  bool get selected => current == value;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : AppColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: selected ? AppColors.primary : AppColors.border),
        ),
        child: Text(label,
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: selected ? Colors.white : AppColors.textSecondary)),
      ),
    );
  }
}

class _ReadingCard extends StatelessWidget {
  final DailyReading reading;
  const _ReadingCard({required this.reading});

  static const _vestmentColors = {
    VestmentColor.white:  Color(0xFFEEEEEE),
    VestmentColor.red:    Color(0xFFC62828),
    VestmentColor.green:  Color(0xFF2E7D32),
    VestmentColor.violet: Color(0xFF6A1B9A),
    VestmentColor.rose:   Color(0xFFAD1457),
    VestmentColor.black:  Color(0xFF212121),
    VestmentColor.gold:   Color(0xFFF57F17),
  };

  @override
  Widget build(BuildContext context) {
    final provider    = context.read<ReadingsProvider>();
    final vestColor   = _vestmentColors[reading.vestment] ?? AppColors.primary;
    final dateStr     = '${reading.date.day.toString().padLeft(2,'0')}/'
                        '${reading.date.month.toString().padLeft(2,'0')}/'
                        '${reading.date.year}';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Vestment colour swatch
            Container(
              width: 6,
              height: 60,
              decoration: BoxDecoration(
                color: vestColor,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(width: 14),

            // Date block
            Container(
              width: 52,
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Text(reading.date.day.toString(),
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800,
                          color: AppColors.primary)),
                  Text(_monthAbbr(reading.date.month),
                      style: const TextStyle(fontSize: 10, color: AppColors.primary,
                          fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            const SizedBox(width: 14),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(reading.dayTitle,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  Text('${reading.liturgyType.label} · ${reading.vestment.label} vestment · ${reading.todaysRosary.label}',
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                  const SizedBox(height: 3),
                  Text(dateStr,
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ],
              ),
            ),

            // Status + actions
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                reading.status == ReadingStatus.published
                    ? StatusBadge.published()
                    : StatusBadge.draft(),
                const SizedBox(height: 8),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.primary),
                      onPressed: () => context.go('/readings/edit/${reading.id}'),
                      tooltip: 'Edit',
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.error),
                      onPressed: () async {
                        final ok = await showConfirmDialog(context,
                            title: 'Delete Reading',
                            message: 'Delete "${reading.dayTitle}"? This cannot be undone.');
                        if (ok) provider.deleteReading(reading.id);
                      },
                      tooltip: 'Delete',
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _monthAbbr(int m) {
    const abbr = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return abbr[m];
  }
}
