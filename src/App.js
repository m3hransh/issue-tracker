import axios from "axios";
import React, { Component } from "react";
import "./App.css";

const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GIT_TOKEN}`,
  },
});

const GET_ISSUES_OF_REPOSITORY = `
  query($organization: String!, $repository: String!) {
    organization(login: $organization){
      name
      url
      repository(name: $repository){
        name
        url
        issues(last: 5) {
          edges{
            node {
              id
              title
              url
            }
          }
        }
      }
    }
  }
`;

const TITLE = "React GraphQL GitHub Client";
const getIssuesOfRepository = path => {
    const [organization, repository] = path.split('/');

    return axiosGitHubGraphQL.post("", {
      query: GET_ISSUES_OF_REPOSITORY,
      variables:{organization, repository}
       });
}

const resolveIssuesQuery = queryResult => () => ({
  organization: queryResult.data.data.organization,
  errors: queryResult.data.errors,
});

class App extends Component {
  state = {
    path: "the-road-to-learn-react/the-road-to-learn-react",
    organization: null,
    errors: null,
  };
  // as the page load
  componentDidMount() {
    // fetch default value of path
    this.onFetchFromGitHub(this.state.path);
  }

  onChange = (event) => {
    this.setState({ path: event.target.value });
    //the path in the state is set according to user input
  };

  onSubmit = (event) => {
    this.onFetchFromGitHub(this.state.path);
    event.preventDefault();
  };
  onFetchFromGitHub = path => {
      getIssuesOfRepository(path).then((queryResult) =>
        this.setState(resolveIssuesQuery(queryResult)),
    );
  };

  render() {
    const { path, organization } = this.state;
    return (
      <div>
        <h1>{TITLE}</h1>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">Show open issues for https://github.com</label>
          <input //input field with onChange handler
            id="url"
            type="text"
            value={path}
            onChange={this.onChange}
            style={{ width: "300px" }}
          />
          <button type="submit">Search</button>
        </form>
        <hr />
        {organization ? (
          <Organization organization={organization} />
        ) : (
          <p>No information yet ...</p>
        )}
      </div>
    );
  }
}

const Organization = ({ organization, errors }) => {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong:</strong>
        {errors.map((error) => error.message).join(" ")}
      </p>
    );
  }
  return (
    <div>
      <p>
        <strong>Issues from Organizatoin: </strong>
        <a href={organization.url}>{organization.name}</a>
      </p>
      <Repository repository={organization.repository} />
    </div>
  );
};

const Repository = ({ repository }) => (
  <div>
    <p>
      <strong>In Repository:</strong>
      <a href={repository.url}>{repository.name}</a>
    </p>
    <ul>
      {repository.issues.edges.map((issue) => (
        <li key={issue.node.id}>
          <a href={issue.node.url}>{issue.node.title}</a>
        </li>
      ))}
    </ul>
  </div>
);

export default App;
