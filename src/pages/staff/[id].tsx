import {
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { FaUserMd } from 'react-icons/fa'
import {
  getStaffDetails,
  StaffDetailsType,
  useStaffDetails,
} from '../../hooks/useStaffDetails'
import { nameFormatter } from '../../utils/nameFormatter'
import { StaffCard } from '../../components/Cards/StaffCard'
import { StaffDetailsCard } from '../../components/DetailsCard/StaffDetailsCard'
import { ActivityCard } from '../../components/DetailsCard/ActivityCard'
import { StaffHistoricCard } from '../../components/StaffHistoricCard/StaffHistoricCard'
import Link from 'next/link'

interface StaffDetailsProps {
  staffSSR: StaffDetailsType
  id: string
}

export default function StaffDetails({ staffSSR, id }: StaffDetailsProps) {
  const router = useRouter()

  const { data: staff } = useStaffDetails(id, {
    initialData: staffSSR,
  })

  return (
    <Box
      overflow="auto"
      sx={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }}
      w="100%"
      p={['0 1rem', '1rem 1.5rem 1rem 3rem']}
    >
      {staff === undefined ? (
        <Spinner />
      ) : (
        <>
          <Heading
            fontWeight={600}
            fontSize="1.5rem"
            color="green.700"
            lineHeight={1}
            display="flex"
            gap="0.5rem"
          >
            <FaUserMd />
            {nameFormatter(staff.fullName)}
          </Heading>
          <Divider mt="1rem" orientation="horizontal" />

          <Flex py="1.5rem" gap="1rem">
            <HStack w="100%">
              <StaffCard
                size={'lg'}
                avatarUrl={staff.avatarUrl}
                fullName={staff.fullName}
                email={staff.email}
                role={staff.role}
                id={staff.id}
                onDuty={staff.onDuty}
              />

              <StaffDetailsCard staff={staff} />
              <ActivityCard reports={staff.reports} services={staff.services} />
            </HStack>
          </Flex>
          <Flex justify="space-between" h="100%" w="100%" gap="1rem">
            <StaffHistoricCard
              services={staff.services}
              roleHistoric={staff.roleHistoric}
            />

            <VStack
              bg="white"
              p="1rem"
              borderRadius={12}
              gap={1}
              align="start"
              w="max-content"
            >
              <Text fontSize="1rem" whiteSpace="normal">
                Documentos
              </Text>
              <Divider />
              <Text
                as={Link}
                lineHeight={1}
                fontSize="1rem"
                color="black"
                p="0.25rem"
                href={'/exams'}
                _hover={{ color: 'gray.600' }}
                transition="color 0.2s"
                whiteSpace="normal"
              >
                Identidade
              </Text>

              <Text
                as={Link}
                lineHeight={1}
                fontSize="1rem"
                color="black"
                p="0.25rem"
                href={'/exams'}
                _hover={{ color: 'gray.600' }}
                transition="color 0.2s"
                whiteSpace="nowrap"
              >
                Carteira de Trabalho
              </Text>
            </VStack>
          </Flex>
        </>
      )}
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = String(params!.id)
  const staff = await getStaffDetails(id)

  return {
    props: {
      staffSSR: staff,
      id,
    },
  }
}
