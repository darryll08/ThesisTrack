import Image from "next/image";

const campusImages = [
  { src: "/images/ftmm-building.jpg", alt: "Gedung FTMM Universitas Airlangga" },
  { src: "/images/nano-building.jpg", alt: "Gedung NANO Universitas Airlangga" },
  { src: "/images/ftmm-auditorium.jpg", alt: "Auditorium FTMM Universitas Airlangga" },
  { src: "/images/unair-workshop.jpg", alt: "Pusat Workshop Universitas Airlangga" },
];

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return <main className="auth-layout">
    <aside className="auth-editorial">
      <div className="auth-slideshow" aria-label="Lingkungan Fakultas Teknologi Maju dan Multidisiplin">
        {campusImages.map((image, index) => <Image key={image.src} src={image.src} alt={image.alt} fill priority={index === 0} sizes="(max-width: 900px) 0px, 58vw" />)}
      </div>
      <div className="auth-photo-shade" aria-hidden="true" />
      <div className="institution-lockup">
        <div className="institution-logos">
          <span className="logo-panel logo-panel-ftmm"><Image src="/brand/ftmm-logo-transparent.png" alt="FTMM Universitas Airlangga" width={738} height={195} priority /></span>
          <span className="logo-divider" aria-hidden="true" />
          <span className="logo-panel logo-panel-unair"><Image src="/brand/unair-emblem-transparent.png" alt="Universitas Airlangga" width={500} height={500} /></span>
          <span className="logo-panel logo-panel-km"><Image src="/brand/kampus-merdeka-logo-transparent.png" alt="Kampus Merdeka" width={685} height={364} /></span>
        </div>
        <div className="auth-identity"><p className="eyebrow">THESISTRACK</p><h2>Sistem Manajemen<br/>Tugas Akhir</h2><p>Fakultas Teknologi Maju dan Multidisiplin<br/>Universitas Airlangga</p></div>
      </div>
      <p className="auth-photo-caption">FTMM · Universitas Airlangga</p>
    </aside>
    <div className="auth-form-side"><div className="auth-mobile-brand"><Image src="/brand/ftmm-logo-transparent.png" alt="FTMM Universitas Airlangga" width={738} height={195} /><strong>ThesisTrack</strong></div><section>{children}</section></div>
  </main>;
}
