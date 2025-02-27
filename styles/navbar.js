.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background: rgba(7, 26, 51, 0.9);
  border-bottom: 2px solid var(--secondary-color);
  backdrop-filter: blur(15px);
  box-shadow: 0px 5px 20px var(--deep-shadow);
}

.navbar a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 18px;
  transition: color 0.3s ease-in-out;
}

.navbar a:hover {
  color: var(--secondary-color);
}
