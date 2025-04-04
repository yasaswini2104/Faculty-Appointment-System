import React from "react";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import { Email, Phone, LinkedIn, Instagram, Facebook, WhatsApp, ArrowUpward } from "@mui/icons-material";

const Footer = () => {
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={styles.footerContainer}>
      {/* Footer Content */}
      <Box sx={styles.content}>
        {/* Quick Links */}
        <Box sx={{ ...styles.section, textAlign: "left" }}> {/* Align Quick Links to left */}
          <Typography variant="h6" sx={styles.heading}>
            Quick Links
          </Typography>
          <Typography sx={styles.link}>Home</Typography>
          <Typography sx={styles.link}>Features</Typography>
          <Typography sx={styles.link}>About</Typography>
          <Typography sx={styles.link}>Terms of Service</Typography>
        </Box>

        {/* Vertical Divider */}
        <Divider orientation="vertical" flexItem sx={styles.divider} />

        {/* Social Media Links */}
        <Box sx={styles.section}>
          <Typography variant="h6" sx={styles.heading}>
            Social Media Links
          </Typography>
          <Box sx={styles.iconContainer}>
            <IconButton sx={{ color: "#0077b5" }} aria-label="LinkedIn">
              <LinkedIn />
            </IconButton>
            <IconButton sx={{ color: "#E4405F" }} aria-label="Instagram">
              <Instagram />
            </IconButton>
            <IconButton sx={{ color: "#1877F2" }} aria-label="Facebook">
              <Facebook />
            </IconButton>
            <IconButton sx={{ color: "#25D366" }} aria-label="WhatsApp">
              <WhatsApp />
            </IconButton>
          </Box>
        </Box>

        {/* Vertical Divider */}
        <Divider orientation="vertical" flexItem sx={styles.divider} />

        {/* Contact Info */}
        <Box sx={{ ...styles.section, textAlign: "left" }}> {/* Align Contact Info to left */}
          <Typography variant="h6" sx={styles.heading}>
            Contact Info
          </Typography>
          <Box sx={{ ...styles.contactItem, justifyContent: "flex-start" }}>
            <Email sx={{ color: "white" }} />
            <Typography sx={styles.link}>support@snacksense.com</Typography>
          </Box>
          <Box sx={{ ...styles.contactItem, justifyContent: "flex-start" }}>
            <Phone sx={{ color: "white" }} />
            <Typography sx={styles.link}>+91 98765 43210</Typography>
          </Box>
        </Box>
      </Box>

      {/* Bottom Bar */}
      <Box sx={styles.bottomBar}>
        <Typography variant="body2">© 2025 SnackSense. All rights reserved.</Typography>
      </Box>

      {/* Back to Top Button */}
      <IconButton sx={styles.backToTop} onClick={scrollToTop} aria-label="Back to Top">
        <ArrowUpward />
      </IconButton>
    </Box>
  );
};

// Styles
const styles = {
  footerContainer: {
    backgroundColor: "#4d552f", // Footer background
    padding: "30px 20px",
    textAlign: "center",
    position: "relative",
  },
  content: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap",
  },
  section: {
    textAlign: "center", // Default alignment (only Quick Links & Contact Info will be overridden)
    width: "200px", // Ensures proper alignment
  },
  heading: {
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  link: {
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  divider: {
    backgroundColor: "white",
    height: "150px",
    width: "2px",
    display: { xs: "none", md: "block" }, // Hide divider on small screens
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "5px",
  },
  bottomBar: {
    backgroundColor: "#9C6928",
    padding: "10px 0",
    marginTop: "20px",
    color: "white",
    fontSize: "14px",
  },
  backToTop: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#9C6928",
    color: "white",
    "&:hover": {
      backgroundColor: "#FFD700",
    },
  },
};

export default Footer;