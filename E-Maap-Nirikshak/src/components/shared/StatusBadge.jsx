const STATUS_STYLES = {
  // Instrument / Certificate statuses
  'Verified':       'bg-green-100 text-green-800 border-green-200',
  'Valid':          'bg-green-100 text-green-800 border-green-200',
  'VALID':          'bg-green-100 text-green-800 border-green-200',
  'Pass':           'bg-green-100 text-green-800 border-green-200',
  'PASS':           'bg-green-100 text-green-800 border-green-200',
  'Certified':      'bg-green-100 text-green-800 border-green-200',
  'Active':         'bg-green-100 text-green-800 border-green-200',
  'Synced':         'bg-green-100 text-green-800 border-green-200',

  'Expired':        'bg-red-100 text-red-800 border-red-200',
  'EXPIRED':        'bg-red-100 text-red-800 border-red-200',
  'Fail':           'bg-red-100 text-red-800 border-red-200',
  'FAIL':           'bg-red-100 text-red-800 border-red-200',
  'Rejected':       'bg-red-100 text-red-800 border-red-200',
  'Revoked':        'bg-red-100 text-red-800 border-red-200',
  'REVOKED':        'bg-red-100 text-red-800 border-red-200',
  'NOT_FOUND':      'bg-red-100 text-red-800 border-red-200',
  'NOT FOUND':      'bg-red-100 text-red-800 border-red-200',
  'INVALID':        'bg-red-100 text-red-800 border-red-200',

  'Pending':        'bg-amber-100 text-amber-800 border-amber-200',
  'Submitted':      'bg-amber-100 text-amber-800 border-amber-200',
  'Under Review':   'bg-amber-100 text-amber-800 border-amber-200',
  'Scheduled':      'bg-blue-100 text-blue-800 border-blue-200',
  'Inspected':      'bg-purple-100 text-purple-800 border-purple-200',
  'Needs Review':   'bg-amber-100 text-amber-800 border-amber-200',
  'NEEDS_REVIEW':   'bg-amber-100 text-amber-800 border-amber-200',
  'Expiring Soon':  'bg-orange-100 text-orange-800 border-orange-200',
  'EXPIRING_SOON':  'bg-orange-100 text-orange-800 border-orange-200',
  'EXPIRING SOON':  'bg-orange-100 text-orange-800 border-orange-200',
  'Sync Pending':   'bg-yellow-100 text-yellow-800 border-yellow-200',

  'new':            'bg-blue-100 text-blue-800 border-blue-200',
  're-verification':'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const styles = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const sizeClass = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${styles} ${sizeClass}`}>
      {status}
    </span>
  );
}
