import { Link } from "react-router-dom";
import styles from "../styles/Header.module.css";
import logo from "../assets/logo.svg"; // Ensure your SVG logo is placed in the 'assets' folder

const Header = () => {
  return (
    <header className={styles.header}>
      {/* Logo on the Left */}
      <img src={logo} alt="Logo" className={styles.logo} />

      {/* Navigation Links */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.myHomePgTitle}>
          Home
        </Link>
        <Link to="/profile/basic-info" className={styles.myProfilePgTitle}>
          My Profile
        </Link>
      </nav>
    </header>
  );
};

export default Header;

// import { Link } from "react-router-dom";
// import styles from "../styles/Header.module.css";
// import logo from "../assets/logo.svg"; // Ensure your SVG logo is placed in the 'assets' folder
// import * as React from "react";
// import Avatar from "@mui/material/Avatar";
// import Stack from "@mui/material/Stack";
// import { deepOrange } from "@mui/material/colors";

// const Header = () => {
//   return (
//     <header className={styles.header}>
//       {/* Logo on the Left */}
//       <img src={logo} alt="Website Logo" className={styles.logo} />

//       {/* Navigation Links */}
//       <nav className={styles.nav}>
//         <Link to="/" className={styles.myHomePgTitle}>
//           Home
//         </Link>
//         <Link to="/profile/basic-info" className={styles.myProfilePgTitle}>
//           My Profile
//         </Link>
//         {/* Avatar Section */}
//         <Stack direction="row" spacing={2}>
//           <Avatar sx={{ bgcolor: deepOrange[500], borderLeft: "100px" }}>
//             N
//           </Avatar>
//         </Stack>
//       </nav>
//     </header>
//   );
// };

// export default Header;
