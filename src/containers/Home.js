import React, { useState, useEffect } from "react";
import { ListGroup, ListGroupItem, Badge, Nav, Button } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner'
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import "./Home.css";
import { API, Auth, Storage } from "aws-amplify";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        //return;
      }

      try {
        const projects = await loadProjects();
        projects.sort((a, b) => {
          /*if (a.createdAt < b.createdAt)
            return 1;
          if (a.createdAt > b.createdAt)
            return -1;
          return 0;*/
          return a.title.localeCompare(b.title);
        });

        //console.log(projects);
        setProjects(projects);
        //setActiveProjects(activeProjects);
        setIsLoading(false);
      } catch (e) {
        onError(e);
      }
      
    }

    onLoad();
  }, [isAuthenticated]);

  async function loadProjects() {
    if (isAuthenticated) {
      const currUser = await Auth.currentAuthenticatedUser();
      //console.log(currUser);
      if (currUser.attributes["custom:role"] === "admin") {
        //console.log("admin: get all projects");
        return API.get("projects", "/projects/all");
      }
    }

    //console.log("user: get user projects");
    return API.get("projects", "/projects");
  }

  function renderProjectsList(projects) {
    //console.log(projects.length + ' projects');
    return [{}].concat(projects).map((project, i) =>
      i !== 0 ? (
        <LinkContainer key={project.projectId} to={`/projects/${project.projectId}`}>
          <ListGroup.Item action>
            <div class="title">
              {project.title.trim().split("\n")[0]}
              {
                project.active
                  ? <Badge variant="primary" className="float-right">Approved</Badge>
                  : <Badge variant="secondary" className="float-right">Pending</Badge>
              }
            </div>
            <div class="subtext">
              {"Created: " + new Date(project.createdAt).toLocaleDateString()}
              {project.updatedAt && <span>;&nbsp;{"Updated: " + new Date(project.updatedAt).toLocaleDateString()}</span>}
            </div>
          </ListGroup.Item>
        </LinkContainer>
      ) : (
          <LinkContainer key="new" to="/projects/new">
            <ListGroup.Item action>
              <b>{"\uFF0B"}</b> Create New Project
            </ListGroup.Item>
          </LinkContainer>
        )
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>FL ACES</h1>
        <p></p>
        <div>
          <Link to="/login" className="btn btn-info btn-lg" style={{ margin: "20px" }}>
            Login
        </Link>
          <Link to="/signup" className="btn btn-success btn-lg" style={{ margin: "20px" }}>
            Signup
        </Link>
        </div>
      </div>
    );
  }

  function renderProjects() {
    return (
      <div className="projects">
        {isLoading &&
          <Spinner animation="border" />
        }
        {!isLoading && projects.length > 0 &&
          <div>{projects.length + " project" + (projects.length > 1 ? "s" : "")}</div>
        }
        <ListGroup>
          {!isLoading && renderProjectsList(projects)}
        </ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {
        isAuthenticated ? renderProjects() : renderLander()
        //renderProjects()
      }
    </div>
  );
}