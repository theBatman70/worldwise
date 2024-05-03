import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import styles from "./PageNav.module.css";

export default function PageNav() {
  return (
    <div className={styles.nav}>
      <Logo />
      <ul>
        <li>
          <NavLink to={'/product'}>Product</NavLink>
        </li>
        <li>
          <NavLink to={'/pricing'}>Pricing</NavLink>
        </li>
        <li>
          <NavLink className={styles.ctaLink} to={'/login'}>Login</NavLink>
        </li>
      </ul>
    </div>
  );
}
