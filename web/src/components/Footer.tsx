import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <span className="logo">
              info<em>background</em>
            </span>
            <p className="footer__about">{t("footer.about")}</p>
          </div>
          <div>
            <h4>{t("footer.col.services")}</h4>
            <ul>
              <li>
                <a href="#services">{t("footer.s1")}</a>
              </li>
              <li>
                <a href="#services">{t("footer.s2")}</a>
              </li>
              <li>
                <a href="#services">{t("footer.s3")}</a>
              </li>
              <li>
                <a href="#services">{t("footer.s4")}</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t("footer.col.contacts")}</h4>
            <ul>
              <li>
                <a href="https://t.me/infobackground" target="_blank" rel="noopener">
                  Telegram
                </a>
              </li>
              <li>
                <a href="https://instagram.com/infobackground" target="_blank" rel="noopener">
                  Instagram
                </a>
              </li>
              <li>
                <a href="mailto:matochkinaleksandr3@gmail.com">Email</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t("footer.col.nav")}</h4>
            <ul>
              <li>
                <a href="#approach">{t("nav.approach")}</a>
              </li>
              <li>
                <a href="#whyus">{t("nav.whyus")}</a>
              </li>
              <li>
                <a href="#testimonials">{t("nav.testimonials")}</a>
              </li>
              <li>
                <a href="#contact">{t("nav.contacts")}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>
            {t("footer.copyright")} · <Link href="/privacy">Privacy</Link>
          </span>
          <span className="status">
            <i />
            <span>{t("footer.status")}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
