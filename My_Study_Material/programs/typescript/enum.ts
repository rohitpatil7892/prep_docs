enum Status {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending"
}

function updateStatus(s: Status) { /* ... */ }

updateStatus(Status.Active);