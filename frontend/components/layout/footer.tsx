import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-bold text-foreground">NestlyCampus</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Find your place. Stay closer. A centralized platform connecting students with verified
              off-campus accommodation.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Students</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse" className="hover:text-primary">Browse accommodation</Link></li>
              <li><Link href="/register" className="hover:text-primary">Create an account</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Landlords</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register?role=LANDLORD" className="hover:text-primary">List your property</Link></li>
              <li><Link href="/login" className="hover:text-primary">Landlord login</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Trust &amp; Safety</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>All landlords are verified by our admin team</li>
              <li>Listings are reviewed before publication</li>
              <li>Report suspicious listings anytime</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} NestlyCampus. Built for students, by students.
        </p>
      </div>
    </footer>
  );
}
