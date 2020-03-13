import React, { useState } from "react"
import { useQuery } from "@apollo/react-hooks"
import { USER } from "../../graphql/queries/user"
import {
  UserData,
  FreeAgentPostsData,
  Weapon,
  FreeAgentPost,
} from "../../types"
import { FREE_AGENT_POSTS } from "../../graphql/queries/freeAgentPosts"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { RouteComponentProps } from "@reach/router"
import Posts from "./Posts"
import PageHeader from "../common/PageHeader"
import { Helmet } from "react-helmet-async"
import WeaponSelector from "../common/WeaponSelector"
import RadioGroup from "../elements/RadioGroup"
import Box from "../elements/Box"
import { continents } from "../../utils/lists"
import { Collapse, Flex } from "@chakra-ui/core"
import Button from "../elements/Button"
import { FaFilter } from "react-icons/fa"
import FAPostModal from "./FAPostModal"

const playstyleToEnum = {
  "Frontline/Slayer": "FRONTLINE",
  "Midline/Support": "MIDLINE",
  "Backline/Anchor": "BACKLINE",
} as const

const FreeAgentsPage: React.FC<RouteComponentProps> = () => {
  const [weapon, setWeapon] = useState<Weapon | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [playstyle, setPlaystyle] = useState<
    "Any" | "Frontline/Slayer" | "Midline/Support" | "Backline/Anchor"
  >("Any")
  const [region, setRegion] = useState<
    "Any" | "Europe" | "The Americas" | "Oceania" | "Other"
  >("Any")
  const { data, error, loading } = useQuery<FreeAgentPostsData>(
    FREE_AGENT_POSTS
  )
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery<UserData>(USER)

  if (error) return <Error errorMessage={error.message} />
  if (loading || userQueryLoading || !data || !userData) return <Loading />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />

  const faPosts = data.freeAgentPosts

  const ownFAPost = faPosts.find(
    post => post.discord_user.discord_id === userData.user?.discord_id
  )

  const buttonText = ownFAPost ? "Edit free agent post" : "New free agent post"

  const postsFilter = (post: FreeAgentPost) => {
    if (post.hidden) return false

    if (weapon && post.discord_user.weapons.indexOf(weapon) === -1) {
      return false
    }

    if (playstyle !== "Any") {
      if (post.playstyles.indexOf(playstyleToEnum[playstyle]) === -1)
        return false
    }

    if (region !== "Any") {
      if (!post.discord_user.country) {
        if (region === "Other") return true

        return false
      }

      const continentCode = continents[post.discord_user.country]

      if (region === "Europe" && continentCode !== "EU") return false
      else if (
        region === "The Americas" &&
        continentCode !== "NA" &&
        continentCode !== "SA"
      )
        return false
      else if (region === "Oceania" && continentCode !== "OC") return false
      else if (
        region === "Other" &&
        continentCode !== "AF" &&
        continentCode !== "AN" &&
        continentCode !== "AS" &&
        continentCode !== "OC"
      )
        return false
    }

    return true
  }

  const showModalButton = () => {
    if (!userData.user) return false

    if (ownFAPost && ownFAPost.hidden) {
      const weekFromCreatingFAPost = parseInt(ownFAPost.createdAt) + 604800000
      if (weekFromCreatingFAPost > Date.now()) {
        return false
      }
    }

    return true
  }

  return (
    <>
      <Helmet>
        <title>Free Agents | sendou.ink</title>
      </Helmet>
      <PageHeader title="Free Agents" />
      {showModal && (
        <FAPostModal closeModal={() => setShowModal(false)} post={ownFAPost} />
      )}
      <Flex justifyContent="space-between" flexWrap="wrap">
        <Box m="0.5em">
          <Button icon={FaFilter} onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide filters" : "Show filters"}
          </Button>
        </Box>
        {showModalButton() && (
          <Box m="0.5em">
            <Button onClick={() => setShowModal(true)}>{buttonText}</Button>
          </Box>
        )}
      </Flex>
      <Collapse mt={4} isOpen={showFilters}>
        <Box maxW="600px" my="1em">
          <RadioGroup
            value={playstyle}
            setValue={setPlaystyle}
            label="Filter by playstyle"
            options={[
              "Any",
              "Frontline/Slayer",
              "Midline/Support",
              "Backline/Anchor",
            ]}
          />
        </Box>
        <Box maxW="600px" my="1em">
          <RadioGroup
            value={region}
            setValue={setRegion}
            label="Filter by region"
            options={["Any", "Europe", "The Americas", "Oceania", "Other"]}
          />
        </Box>
        <Box maxW="600px" my="1em">
          <WeaponSelector
            label="Filter by weapon"
            value={weapon}
            setValue={(weapon: string) => setWeapon(weapon as Weapon)}
            clearable
          />
        </Box>
      </Collapse>
      <Posts posts={faPosts.filter(postsFilter)} />
    </>
  )
}

export default FreeAgentsPage
