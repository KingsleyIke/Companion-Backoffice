import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/parish_provider.dart';
import '../../router/app_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shared_widgets.dart';
import '../../models/parish.dart';
import '../../data/mock_data.dart';

class ParishesScreen extends StatelessWidget {
  const ParishesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ParishProvider>();
    final list     = provider.filtered;

    return Column(
      children: [
        PageHeader(
          title: 'Parishes',
          subtitle: '${provider.parishes.length} total · ${provider.activeCount} active',
          actions: [
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.white,
                  foregroundColor: AppColors.primary),
              onPressed: () => context.go(AppRoutes.addParish),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Add Parish'),
            ),
          ],
        ),

        // ── Filters ──────────────────────────────────────────────────────────
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: _FilterBar(provider: provider),
        ),

        // ── List ─────────────────────────────────────────────────────────────
        Expanded(
          child: list.isEmpty
              ? EmptyState(
                  icon: Icons.location_city_outlined,
                  message: 'No parishes found.\nTry adjusting filters.',
                  actionLabel: 'Add Parish',
                  onAction: () => context.go(AppRoutes.addParish),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (ctx, i) => _ParishCard(parish: list[i]),
                ),
        ),
      ],
    );
  }
}

class _FilterBar extends StatelessWidget {
  final ParishProvider provider;
  const _FilterBar({required this.provider});

  @override
  Widget build(BuildContext context) {
    final archs  = archdioceses[provider.countryFilter] ?? [];
    final deans  = deaneries[provider.archFilter] ?? [];

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        SizedBox(
          width: 220,
          child: TextField(
            onChanged: provider.setSearch,
            decoration: InputDecoration(
              hintText: 'Search parishes…',
              prefixIcon: const Icon(Icons.search, size: 18),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
              suffixIcon: provider.searchQuery.isNotEmpty
                  ? IconButton(icon: const Icon(Icons.clear, size: 16),
                      onPressed: () => provider.setSearch(''))
                  : null,
            ),
          ),
        ),
        _DropdownFilter(
          hint: 'Country',
          value: provider.countryFilter.isEmpty ? null : provider.countryFilter,
          items: countries,
          onChanged: (v) { provider.setCountry(v ?? ''); provider.setArch(''); provider.setDeanery(''); },
        ),
        _DropdownFilter(
          hint: 'Archdiocese',
          value: provider.archFilter.isEmpty ? null : provider.archFilter,
          items: archs,
          onChanged: (v) { provider.setArch(v ?? ''); provider.setDeanery(''); },
        ),
        _DropdownFilter(
          hint: 'Deanery',
          value: provider.deaneryFilter.isEmpty ? null : provider.deaneryFilter,
          items: deans,
          onChanged: (v) => provider.setDeanery(v ?? ''),
        ),
        if (provider.countryFilter.isNotEmpty || provider.archFilter.isNotEmpty ||
            provider.deaneryFilter.isNotEmpty || provider.searchQuery.isNotEmpty)
          TextButton.icon(
            onPressed: provider.clearFilters,
            icon: const Icon(Icons.clear, size: 14),
            label: const Text('Clear', style: TextStyle(fontSize: 12)),
          ),
      ],
    );
  }
}

class _DropdownFilter extends StatelessWidget {
  final String hint;
  final String? value;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  const _DropdownFilter({
    required this.hint, required this.value,
    required this.items, required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: DropdownButtonFormField<String>(
        value: value,
        hint: Text(hint, style: const TextStyle(fontSize: 12)),
        isDense: true,
        decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10)),
        items: [
          DropdownMenuItem(value: null, child: Text('All $hint', style: const TextStyle(fontSize: 12))),
          ...items.map((o) => DropdownMenuItem(value: o, child: Text(o, style: const TextStyle(fontSize: 12)))),
        ],
        onChanged: onChanged,
      ),
    );
  }
}

class _ParishCard extends StatelessWidget {
  final Parish parish;
  const _ParishCard({required this.parish});

  @override
  Widget build(BuildContext context) {
    final provider = context.read<ParishProvider>();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Icon
            Container(
              width: 46, height: 46,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.location_city, color: AppColors.primary, size: 24),
            ),
            const SizedBox(width: 14),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(parish.name,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  Text('${parish.country} · ${parish.archdiocese} · ${parish.deanery}',
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                  const SizedBox(height: 3),
                  Text(
                    '${parish.contacts.length} contacts · '
                    '${parish.activities.length} activities · '
                    '${parish.announcements.length} announcements',
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),

            // Status + actions
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _statusBadge(parish.status),
                const SizedBox(height: 8),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.primary),
                      onPressed: () => context.go('/parishes/edit/${parish.id}'),
                      tooltip: 'Edit',
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.error),
                      onPressed: () async {
                        final ok = await showConfirmDialog(context,
                            title: 'Delete Parish',
                            message: 'Delete "${parish.name}"? This cannot be undone.');
                        if (ok) provider.deleteParish(parish.id);
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

  Widget _statusBadge(ParishStatus s) {
    switch (s) {
      case ParishStatus.active:   return StatusBadge.active();
      case ParishStatus.pending:  return StatusBadge.pending();
      case ParishStatus.inactive: return StatusBadge.inactive();
    }
  }
}
